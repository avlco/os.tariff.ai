// 📁 File: functions/fetchExternalUsers.ts
// [מערכת הניהול - os.tariff.ai]
import { withAuth } from './auth/middleware.ts';
import { Permission } from './auth/types.ts';
import { decrypt } from './utils/encryption.ts'; // ✅ ייבוא מנוע ההצפנה

export default Deno.serve(withAuth(async (req, user, base44) => {
    try {
        const apiKey = Deno.env.get('TARIFFAI_APP_API_KEY');
        if (!apiKey) {
            return Response.json({ error: 'API key not configured' }, { status: 500 });
        }

        // שליפת כל הנתונים במקביל
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

        // חישוב תאריכים
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // ✅ שימוש ב-Promise.all לפענוח מקבילי
        const mappedUsers = await Promise.all(users.map(async (u: any) => {
            // זיהוי המשתמש (יכול להיות מוצפן או רגיל)
            const rawUserEmail = u.user_email || u.created_by;
            
            // 🔐 פענוח שדות רגישים לתצוגה
            const displayEmail = await decrypt(rawUserEmail);
            const displayFullName = await decrypt(u.full_name || '');
            const displayCompany = await decrypt(u.company_name || '');
            const displayPhone = await decrypt(u.phone || '');

            // חישוב סטטיסטיקות (מתבצע על הערכים הגולמיים כדי לשמור על התאמה)
            const userReports = reports.filter((r: any) => 
                (r.user_email === rawUserEmail || r.created_by === rawUserEmail)
            );
            
            const reportsThisMonth = userReports.filter((r: any) => {
                const reportDate = new Date(r.created_date);
                return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
            }).length;

            // איתור תוכנית מנוי
            const userPayments = payments
                .filter((p: any) => (p.user_email === rawUserEmail || p.created_by === rawUserEmail) && p.status === 'completed')
                .sort((a: any, b: any) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
            const actualPlan = userPayments.length > 0 ? userPayments[0].plan : (u.subscription_plan || 'free');

            return {
                id: u.id,
                user_id: u.id,
                email: displayEmail,
                full_name: displayFullName,
                company: displayCompany,
                phone: displayPhone,
                plan: actualPlan,
                status: u.account_status || 'active',
                reports_this_month: reportsThisMonth,
                total_reports: userReports.length,
                preferred_language: u.preferred_language || 'he',
                last_active: u.last_login || u.updated_date,
                created_date: u.registration_date || u.created_date
            };
        }));

        return Response.json(mappedUsers);
    } catch (error: any) {
        console.error('Error fetching users:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}, Permission.MANAGE_USERS));
