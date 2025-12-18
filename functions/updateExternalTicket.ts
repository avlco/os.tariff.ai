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

        const { entityId, updateData } = await req.json();

        if (!entityId || !updateData) {
            return Response.json({ 
                error: 'Missing entityId or updateData' 
            }, { status: 400 });
        }

        // Update SupportTicket in external app
        const response = await fetch(
            `https://app.base44.com/api/apps/69442ba2ce33e908142d9721/entities/SupportTicket/${entityId}`,
            {
                method: 'PUT',
                headers: {
                    'api_key': apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            }
        );

        if (!response.ok) {
            return Response.json({ 
                error: 'Failed to update ticket in external app',
                status: response.status 
            }, { status: response.status });
        }

        const data = await response.json();
        return Response.json(data);
    } catch (error) {
        console.error('Error updating external ticket:', error);
        return Response.json({ 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    }
});