// 📁 File: functions/fetchExternalTickets.ts
// [מערכת הניהול - os.tariff.ai]
import { withAuth } from './auth/middleware.ts';
import { Permission } from './auth/types.ts';
import { decrypt } from './utils/encryption.ts'; // ✅ ייבוא מנוע ההצפנה

export default Deno.serve(withAuth(async (req, user, base44) => {
    try {
        const apiKey = Deno.env.get("TAIRFFAI_APP_API_KEY");
        if (!apiKey) {
            return Response.json({ error: 'API key not configured' }, { status: 500 });
        }

        // שליפת כרטיסי תמיכה
        const response = await fetch(
            `https://app.base44.com/api/apps/6944f7300c31b18399592a2a/entities/SupportTicket`,
            {
                headers: {
                    'api_key': apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            return Response.json({ 
                error: 'Failed to fetch tickets from external app',
                status: response.status 
            }, { status: response.status });
        }

        const data = await response.json();

        // ✅ פענוח תוכן ההודעות והפרטים האישיים
        const mappedTickets = await Promise.all(data.map(async (ticket: any) => {
            const decryptedSubject = await decrypt(ticket.subject);
            const decryptedMessage = await decrypt(ticket.message);
            const decryptedResponse = ticket.response ? await decrypt(ticket.response) : null;
            const decryptedEmail = await decrypt(ticket.created_by);

            return {
                id: ticket.id,
                user_id: ticket.created_by,
                user_email: decryptedEmail,
                user_name: decryptedEmail, // בדרך כלל זה האימייל
                subject: decryptedSubject,
                category: ticket.category,
                priority: ticket.priority,
                status: ticket.status,
                message: decryptedMessage,
                messages: decryptedResponse ? [{ sender: 'admin', message: decryptedResponse }] : [],
                assigned_to: ticket.assigned_to,
                resolved_at: ticket.resolved_at,
                created_date: ticket.created_date
            };
        }));

        return Response.json(mappedTickets);
    } catch (error: any) {
        console.error('Error fetching external tickets:', error);
        return Response.json({ 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    }
}, Permission.MANAGE_USERS));
