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

        // Fetch SupportTicket entities from external app
        const response = await fetch(
            `https://app.base44.com/api/apps/69442ba2ce33e908142d9721/entities/SupportTicket`,
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

        // Map external data structure to internal SupportTicket structure
        const mappedTickets = data.map(ticket => ({
            id: ticket.id,
            user_id: ticket.user_id,
            user_email: ticket.user_email,
            user_name: ticket.user_name,
            subject: ticket.subject,
            category: ticket.category,
            priority: ticket.priority,
            status: ticket.status,
            message: ticket.message,
            messages: ticket.messages || [],
            assigned_to: ticket.assigned_to,
            resolved_at: ticket.resolved_at,
            created_date: ticket.created_date
        }));

        return Response.json(mappedTickets);
    } catch (error) {
        console.error('Error fetching external tickets:', error);
        return Response.json({ 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    }
});