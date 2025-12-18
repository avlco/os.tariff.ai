import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const apiKey = Deno.env.get("EXTERNAL_APP_API_KEY");
        if (!apiKey) {
            return Response.json({ error: 'API key not configured' }, { status: 500 });
        }

        // Fetch UserSubscription entities from external app
        const response = await fetch(
            `https://app.base44.com/api/apps/69442ba2ce33e908142d9721/entities/UserSubscription`,
            {
                headers: {
                    'api_key': apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            return Response.json({ 
                error: 'Failed to fetch users from external app',
                status: response.status 
            }, { status: response.status });
        }

        const data = await response.json();

        // Map external UserSubscription to internal AppUser structure
        const mappedUsers = data.map(subscription => ({
            user_id: subscription.user_id,
            email: subscription.email,
            full_name: subscription.full_name || subscription.user_name,
            company: subscription.company,
            phone: subscription.phone,
            plan: subscription.plan_type || subscription.plan || 'free',
            status: subscription.status || 'active',
            reports_this_month: subscription.reports_used_this_month || 0,
            total_reports: subscription.total_reports || 0,
            subscription_start: subscription.subscription_start_date || subscription.created_date,
            subscription_end: subscription.subscription_end_date,
            preferred_language: subscription.preferred_language || 'he',
            last_active: subscription.last_login || subscription.updated_date,
            created_date: subscription.created_date
        }));

        return Response.json(mappedUsers);
    } catch (error) {
        console.error('Error fetching external users:', error);
        return Response.json({ 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    }
});