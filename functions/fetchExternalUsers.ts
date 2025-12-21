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

        // Fetch UserMasterData from external app
        const response = await fetch(`https://app.base44.com/api/apps/6944f7300c31b18399592a2a/entities/UserMasterData`, {
            headers: {
                'api_key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('External API error:', response.status, errorText);
            return Response.json({ 
                error: 'Failed to fetch users from external app',
                details: errorText 
            }, { status: response.status });
        }

        const users = await response.json();
        
        // Map the data to match AdminUsers expected format
        const mappedUsers = users.map(user => ({
            id: user.id,
            user_id: user.id,
            email: user.user_email || user.created_by,
            full_name: user.full_name || '',
            company: user.company_name || '',
            phone: user.phone || '',
            plan: user.subscription_plan || 'free',
            status: user.account_status || 'active',
            reports_this_month: user.reports_used_this_month || 0,
            total_reports: user.total_reports_created || 0,
            preferred_language: user.preferred_language || 'he',
            last_active: user.last_login || user.updated_date,
            created_date: user.registration_date || user.created_date
        }));

        return Response.json(mappedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});