import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch AppUser entities from current app
        const appUsers = await base44.asServiceRole.entities.AppUser.list();

        // Map AppUser to expected structure
        const mappedUsers = appUsers.map(u => ({
            id: u.id,
            user_id: u.user_id,
            email: u.email,
            full_name: u.full_name,
            company: u.company,
            phone: u.phone,
            plan: u.plan || 'free',
            status: u.status || 'active',
            reports_this_month: u.reports_this_month || 0,
            total_reports: u.total_reports || 0,
            subscription_start: u.subscription_start,
            subscription_end: u.subscription_end,
            preferred_language: u.preferred_language || 'he',
            last_active: u.last_active || u.updated_date,
            created_date: u.created_date
        }));

        return Response.json(mappedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        return Response.json({ 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    }
});