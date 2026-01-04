import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch legal document history from the App's API
    const appApiKey = Deno.env.get("TAIRFFAI_APP_API_KEY");
    if (!appApiKey) {
      return Response.json({ error: 'App API key not configured' }, { status: 500 });
    }

    const response = await fetch('https://app.tariff-ai.com/api/functions/getLegalHistory', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appApiKey}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error: `Failed to fetch history: ${error}` }, { status: response.status });
    }

    const result = await response.json();
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});