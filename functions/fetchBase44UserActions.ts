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

        const response = await fetch(`https://app.base44.com/api/apps/6943f4e2bf8334936af2edbc/entities/UserAction`, {
            headers: {
                'api_key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return Response.json({ error: 'Failed to fetch user actions' }, { status: response.status });
        }

        const data = await response.json();
        
        // Archive the data asynchronously
        try {
            const archivePromises = data.map(record => 
                base44.asServiceRole.entities.ArchivedUserAction.create({
                    ...record,
                    archived_date: new Date().toISOString(),
                    original_created_date: record.created_date
                })
            );
            await Promise.all(archivePromises);
            console.log(`Archived ${data.length} user actions`);
        } catch (archiveError) {
            console.error('Error archiving user actions:', archiveError);
            // Continue even if archiving fails
        }
        
        return Response.json(data);
    } catch (error) {
        console.error('Error fetching user actions:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});