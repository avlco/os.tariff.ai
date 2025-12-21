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

        // Fetch all data in parallel
        const [usersResponse, reportsResponse, paymentsResponse] = await Promise.all([
            fetch(`https://app.base44.com/api/apps/6944f7300c31b18399592a2a/entities/UserMasterData`, {
                headers: { 'api_key': apiKey, 'Content-Type': 'application/json' }
            }),
            fetch(`https://app.base44.com/api/apps/6944f7300c31b18399592a2a/entities/ClassificationReport`, {
                headers: { 'api_key': apiKey, 'Content-Type': 'application/json' }
            }),
            fetch(`https://app.base44.com/api/apps/6944f7300c31b18399592a2a/entities/Payment`, {
                headers: { 'api_key': apiKey, 'Content-Type': 'application/json' }
            })
        ]);

        if (!usersResponse.ok) {
            const errorText = await usersResponse.text();
            console.error('External API error:', usersResponse.status, errorText);
            return Response.json({ 
                error: 'Failed to fetch users from external app',
                details: errorText 
            }, { status: usersResponse.status });
        }

        const users = await usersResponse.json();
        const reports = reportsResponse.ok ? await reportsResponse.json() : [];
        const payments = paymentsResponse.ok ? await paymentsResponse.json() : [];

        // Calculate real stats per user
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const mappedUsers = users.map(user => {
            const userEmail = user.user_email || user.created_by;
            
            // Calculate actual reports this month
            const userReports = reports.filter(r => 
                (r.user_email === userEmail || r.created_by === userEmail)
            );
            const reportsThisMonth = userReports.filter(r => {
                const reportDate = new Date(r.created_date);
                return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
            }).length;

            // Get actual plan from latest completed payment
            const userPayments = payments
                .filter(p => (p.user_email === userEmail || p.created_by === userEmail) && p.status === 'completed')
                .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
            const actualPlan = userPayments.length > 0 ? userPayments[0].plan : (user.subscription_plan || 'free');

            return {
                id: user.id,
                user_id: user.id,
                email: userEmail,
                full_name: user.full_name || '',
                company: user.company_name || '',
                phone: user.phone || '',
                plan: actualPlan,
                status: user.account_status || 'active',
                reports_this_month: reportsThisMonth,
                total_reports: userReports.length,
                preferred_language: user.preferred_language || 'he',
                last_active: user.last_login || user.updated_date,
                created_date: user.registration_date || user.created_date
            };
        });

        return Response.json(mappedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});