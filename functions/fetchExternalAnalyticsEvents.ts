// 📁 File: functions/fetchExternalAnalyticsEvents.ts
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { withAuth } from './auth/middleware.ts';
import { Permission } from './auth/types.ts';

export default Deno.serve(withAuth(async (req, user, base44) => {
    try {
        // ה-middleware כבר וידא שהמשתמש הוא אדמין עם הרשאת צפייה באנליטיקה
        
        const apiKey = Deno.env.get('TAIRFFAI_APP_API_KEY');
        if (!apiKey) {
            return Response.json({ error: 'API key not configured' }, { status: 500 });
        }

        const appId = '6943f4e2bf8334936af2edbc';

        // Fetch data from all analytics entities sequentially to avoid rate limits
        const pageViewsResponse = await fetch(`https://app.base44.com/api/apps/${appId}/entities/PageView`, {
            headers: { 'api_key': apiKey, 'Content-Type': 'application/json' }
        });
        const pageViews = pageViewsResponse.ok ? await pageViewsResponse.json() : [];

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

        const userActionsResponse = await fetch(`https://app.base44.com/api/apps/${appId}/entities/UserAction`, {
            headers: { 'api_key': apiKey, 'Content-Type': 'application/json' }
        });
        const userActions = userActionsResponse.ok ? await userActionsResponse.json() : [];

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

        const conversionsResponse = await fetch(`https://app.base44.com/api/apps/${appId}/entities/Conversion`, {
            headers: { 'api_key': apiKey, 'Content-Type': 'application/json' }
        });
        const conversions = conversionsResponse.ok ? await conversionsResponse.json() : [];

        // Map and unify all events into ArchivedAnalyticsEvent format
        // שימוש ב-any זמני כדי למנוע שגיאות טיפוסים ב-map
        const allEvents = [
            ...pageViews.map((pv: any) => ({
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
            ...userActions.map((ua: any) => ({
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
            ...conversions.map((c: any) => ({
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
            const archivePromises = allEvents.map((event: any) => 
                base44.asServiceRole.entities.ArchivedAnalyticsEvent.create({
                    ...event,
                    archived_date: new Date().toISOString(),
                    original_created_date: event.created_date
                })
            );
            await Promise.all(archivePromises);
            console.log(`Archived ${allEvents.length} analytics events`);
        } catch (archiveError) {
            console.error('Error archiving analytics events:', archiveError);
        }
        
        return Response.json(allEvents);
    } catch (error: any) {
        console.error('Error fetching analytics events:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}, Permission.VIEW_ANALYTICS)); // ✅ הגנה: רק בעלי הרשאת צפייה באנליטיקה
