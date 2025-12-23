import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch archived analytics events
        const archivedData = await base44.asServiceRole.entities.ArchivedAnalyticsEvent.list();
        
        // Flatten the data structure
        const flattenedData = archivedData.map(record => ({
            id: record.id,
            created_date: record.created_date,
            updated_date: record.updated_date,
            created_by: record.created_by,
            ...(record.data || {})
        }));
        
        return Response.json(flattenedData);
    } catch (error) {
        console.error('Error fetching analytics events:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});