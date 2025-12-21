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

        // Parse request body to get optional customer_id filter
        let customerId = null;
        try {
            const body = await req.json();
            customerId = body.customer_id;
        } catch (e) {
            // No body or invalid JSON - fetch all shipments
        }

        // Build URL with optional filter
        let url = 'https://app.base44.com/api/apps/6944f7300c31b18399592a2a/entities/Shipment';
        if (customerId) {
            url += `?filter=${encodeURIComponent(JSON.stringify({ customer_id: customerId }))}`;
        }

        const response = await fetch(url, {
            headers: {
                'api_key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return Response.json({ error: 'Failed to fetch shipments' }, { status: response.status });
        }

        const data = await response.json();
        
        return Response.json(data);
    } catch (error) {
        console.error('Error fetching shipments:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});