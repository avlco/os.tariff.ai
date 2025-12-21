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

        const response = await fetch(`https://app.base44.com/api/apps/6944f7300c31b18399592a2a/entities/AnalyticsEvent`, {
            headers: {
                'api_key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('External API error:', response.status, errorText);
            return Response.json({ 
                error: 'Failed to fetch analytics events from external app',
                details: errorText 
            }, { status: response.status });
        }

        const events = await response.json();
        return Response.json(events);
    } catch (error) {
        console.error('Error fetching analytics events:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});