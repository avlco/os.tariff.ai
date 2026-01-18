// 📁 File: functions/fetchExternalUsers.ts
import { withAuth } from './auth/middleware.ts';
import { Permission } from './auth/types.ts';

export default Deno.serve(withAuth(async (req, user, base44) => {
    try {
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

        const mappedUsers = users.map((u: any) => {
            const userEmail = u.user_email || u.created_by;
            
            // Calculate actual reports this month
            const userReports = reports.filter((r: any) => 
                (r.user_email === userEmail || r.created_by === userEmail)
            );
            const reportsThisMonth = userReports.filter((r: any) => {
                const reportDate = new Date(r.created_date);
                return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
            }).length;

            // Get actual plan from latest completed payment
            const userPayments = payments
                .filter((p: any) => (p.user_email === userEmail || p.created_by === userEmail) && p.status === 'completed')
                .sort((a: any, b: any) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
            const actualPlan = userPayments.length > 0 ? userPayments[0].plan : (u.subscription_plan || 'free');

            return {
                id: u.id,
                user_id: u.id,
                email: userEmail,
                full_name: u.full_name || '',
                company: u.company_name || '',
                phone: u.phone || '',
                plan: actualPlan,
                status: u.account_status || 'active',
                reports_this_month: reportsThisMonth,
                total_reports: userReports.length,
                preferred_language: u.preferred_language || 'he',
                last_active: u.last_login || u.updated_date,
                created_date: u.registration_date || u.created_date
            };
        });

        return Response.json(mappedUsers);
    } catch (error: any) {
        console.error('Error fetching users:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}, Permission.MANAGE_USERS));
