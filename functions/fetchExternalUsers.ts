import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const apiKey = Deno.env.get("TAIRFFAI_APP_API_KEY");
        if (!apiKey) {
            return Response.json({ error: 'API key not configured' }, { status: 500 });
        }

        // Fetch User entities from external app
        const response = await fetch(
            `https://app.base44.com/api/apps/69442ba2ce33e908142d9721/entities/User`,
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

        // Map external User to internal AppUser structure
        const mappedUsers = data.map(user => ({
            user_id: user.id,
            email: user.email,
            full_name: user.full_name,
            company: user.company,
            phone: user.phone,
            plan: user.plan || 'free',
            status: user.status || 'active',
            reports_this_month: user.reports_this_month || 0,
            total_reports: user.total_reports || 0,
            subscription_start: user.subscription_start || user.created_date,
            subscription_end: user.subscription_end,
            preferred_language: user.preferred_language || 'he',
            last_active: user.last_active || user.updated_date,
            created_date: user.created_date
        }));

        return Response.json(mappedUsers);
    } catch (error) {
        console.error('Error fetching external users:', error);
        return Response.json({ 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    }
});