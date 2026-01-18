// 📁 File: functions/fetchExternalPayments.ts
import { withAuth } from './auth/middleware.ts';
import { Permission } from './auth/types.ts';

export default Deno.serve(withAuth(async (req, user, base44) => {
    try {
        const apiKey = Deno.env.get("TARIFFAI_APP_API_KEY");
        if (!apiKey) {
            return Response.json({ error: 'API key not configured' }, { status: 500 });
        }

        // Fetch Payment entities from external app (if exists)
        const response = await fetch(
            `https://app.base44.com/api/apps/6944f7300c31b18399592a2a/entities/Payment`,
            {
                headers: {
                    'api_key': apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            // If Payment entity doesn't exist, return empty array
            return Response.json([]);
        }

        const data = await response.json();

        // Map external Payment structure to internal structure
        const mappedPayments = data.map((payment: any) => ({
            user_id: payment.user_id,
            user_email: payment.user_email,
            amount: payment.amount,
            currency: payment.currency || 'USD',
            payment_type: payment.payment_type || 'subscription',
            plan: payment.plan,
            status: payment.status,
            payment_method: payment.payment_method,
            transaction_id: payment.transaction_id,
            billing_period_start: payment.billing_period_start,
            billing_period_end: payment.billing_period_end,
            created_date: payment.created_date
        }));

        return Response.json(mappedPayments);
    } catch (error: any) {
        console.error('Error fetching external payments:', error);
        return Response.json({ 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    }
}, Permission.VIEW_ANALYTICS));
