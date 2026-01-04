import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const payload = await req.json();

    // Step 1: Save locally to OS database
    try {
      // Set all existing versions to inactive
      const existingVersions = await base44.asServiceRole.entities.LegalDocumentVersion.list();
      for (const version of existingVersions) {
        if (version.is_active) {
          await base44.asServiceRole.entities.LegalDocumentVersion.update(version.id, { 
            is_active: false 
          });
        }
      }

      // Create new version locally
      await base44.asServiceRole.entities.LegalDocumentVersion.create({
        version: payload.version,
        terms: payload.terms,
        privacy: payload.privacy,
        summary: payload.summary,
        is_active: true,
        published_at: new Date().toISOString()
      });
    } catch (localError) {
      console.error('Local save error:', localError);
      return Response.json({ 
        error: `Failed to save locally: ${localError.message}` 
      }, { status: 500 });
    }

    // Step 2: Push to App's API
    try {
      const appApiKey = Deno.env.get("TAIRFFAI_APP_API_KEY");
      if (!appApiKey) {
        throw new Error('App API key not configured');
      }

      const appResponse = await fetch('https://app.tariff-ai.com/api/functions/publishLegalDocument', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${appApiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!appResponse.ok) {
        const errorText = await appResponse.text();
        throw new Error(`App API error (${appResponse.status}): ${errorText}`);
      }

      const appResult = await appResponse.json();
      
      return Response.json({ 
        success: true, 
        local: 'saved',
        app: appResult 
      });
    } catch (appError) {
      console.error('App sync error:', appError);
      // Local save succeeded, but app sync failed
      return Response.json({ 
        success: true,
        local: 'saved',
        app: 'failed',
        warning: `Saved locally but failed to sync to app: ${appError.message}`
      }, { status: 207 }); // 207 Multi-Status
    }
  } catch (error) {
    console.error('Publish error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});