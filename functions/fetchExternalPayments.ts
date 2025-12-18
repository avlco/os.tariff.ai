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

        // Fetch Payment entities from external app (if exists)
        const response = await fetch(
            `https://app.base44.com/api/apps/69442ba2ce33e908142d9721/entities/Payment`,
            {
                headers: {
                    'api_key': apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            // If Payment entity doesn't exist, try to fetch from UserSubscription and create payment records
            const subscriptionResponse = await fetch(
                `https://app.base44.com/api/apps/69442ba2ce33e908142d9721/entities/UserSubscription`,
                {
                    headers: {
                        'api_key': apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!subscriptionResponse.ok) {
                return Response.json({ 
                    error: 'Failed to fetch payment data from external app',
                    status: subscriptionResponse.status 
                }, { status: subscriptionResponse.status });
            }

            const subscriptions = await subscriptionResponse.json();
            
            // Generate payment records from subscriptions
            const mappedPayments = subscriptions
                .filter(sub => sub.plan_type !== 'free' && sub.subscription_start_date)
                .map(sub => ({
                    user_id: sub.user_id,
                    user_email: sub.email,
                    amount: sub.last_payment_amount || 0,
                    currency: 'USD',
                    payment_type: 'subscription',
                    plan: sub.plan_type || 'basic',
                    status: 'completed',
                    payment_method: sub.payment_method || 'credit_card',
                    transaction_id: sub.stripe_subscription_id || `sub_${sub.id}`,
                    billing_period_start: sub.subscription_start_date,
                    billing_period_end: sub.subscription_end_date,
                    created_date: sub.last_payment_date || sub.subscription_start_date
                }));

            return Response.json(mappedPayments);
        }

        const data = await response.json();

        // Map external Payment structure to internal structure
        const mappedPayments = data.map(payment => ({
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
    } catch (error) {
        console.error('Error fetching external payments:', error);
        return Response.json({ 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    }
});