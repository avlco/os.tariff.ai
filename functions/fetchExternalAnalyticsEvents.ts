import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const apiKey = Deno.env.get('TAIRFFAI_APP_API_KEY');
        if (!apiKey) {
            return Response.json({ error: 'API key not configured' }, { status: 500 });
        }

        const appId = '6943f4e2bf8334936af2edbc';

        // Fetch data from all analytics entities
        const [pageViewsResponse, userActionsResponse, conversionsResponse] = await Promise.all([
            fetch(`https://app.base44.com/api/apps/${appId}/entities/PageView`, {
                headers: { 'api_key': apiKey, 'Content-Type': 'application/json' }
            }),
            fetch(`https://app.base44.com/api/apps/${appId}/entities/UserAction`, {
                headers: { 'api_key': apiKey, 'Content-Type': 'application/json' }
            }),
            fetch(`https://app.base44.com/api/apps/${appId}/entities/Conversion`, {
                headers: { 'api_key': apiKey, 'Content-Type': 'application/json' }
            })
        ]);

        const pageViews = pageViewsResponse.ok ? await pageViewsResponse.json() : [];
        const userActions = userActionsResponse.ok ? await userActionsResponse.json() : [];
        const conversions = conversionsResponse.ok ? await conversionsResponse.json() : [];

        // Map and unify all events into ArchivedAnalyticsEvent format
        const allEvents = [
            ...pageViews.map(pv => ({
                event_type: 'page_view',
                user_id: pv.user_id,
                page: pv.page_url,
                platform: 'web',
                device_type: pv.device_type,
                country: pv.country,
                metadata: {
                    page_title: pv.page_title,
                    referrer: pv.referrer,
                    browser: pv.browser,
                    os: pv.os,
                    session_id: pv.session_id
                },
                created_date: pv.created_date
            })),
            ...userActions.map(ua => ({
                event_type: ua.action_type,
                user_id: ua.user_id,
                page: ua.page_url,
                platform: 'web',
                device_type: null,
                country: null,
                metadata: {
                    action_name: ua.action_name,
                    element_id: ua.element_id,
                    element_text: ua.element_text,
                    session_id: ua.session_id
                },
                created_date: ua.created_date
            })),
            ...conversions.map(c => ({
                event_type: c.conversion_type,
                user_id: c.user_id,
                page: c.page_url,
                platform: 'web',
                device_type: null,
                country: null,
                metadata: {
                    conversion_name: c.conversion_name,
                    value: c.value,
                    currency: c.currency,
                    session_id: c.session_id
                },
                created_date: c.created_date
            }))
        ];

        // Archive the unified events asynchronously
        try {
            const archivePromises = allEvents.map(event => 
                base44.asServiceRole.entities.ArchivedAnalyticsEvent.create({
                    ...event,
                    archived_date: new Date().toISOString(),
                    original_created_date: event.created_date
                })
            );
            await Promise.all(archivePromises);
            console.log(`Archived ${allEvents.length} analytics events (${pageViews.length} page views, ${userActions.length} actions, ${conversions.length} conversions)`);
        } catch (archiveError) {
            console.error('Error archiving analytics events:', archiveError);
            // Continue even if archiving fails
        }
        
        return Response.json(allEvents);
    } catch (error) {
        console.error('Error fetching analytics events:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});