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

        const { entityId, updateData } = await req.json();
        
        if (!entityId || !updateData) {
            return Response.json({ error: 'Missing entityId or updateData' }, { status: 400 });
        }

        // Update UserMasterData in external app
        const response = await fetch(`https://app.base44.com/api/apps/6944f7300c31b18399592a2a/entities/UserMasterData/${entityId}`, {
            method: 'PUT',
            headers: {
                'api_key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('External API error:', response.status, errorText);
            return Response.json({ 
                error: 'Failed to update user in external app',
                details: errorText 
            }, { status: response.status });
        }

        const result = await response.json();
        return Response.json(result);
    } catch (error) {
        console.error('Error updating user:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});