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

        // Fetch ClassificationReport entities from external app
        const response = await fetch(
            `https://app.base44.com/api/apps/69442ba2ce33e908142d9721/entities/ClassificationReport`,
            {
                headers: {
                    'api_key': apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            return Response.json({ 
                error: 'Failed to fetch reports from external app',
                status: response.status 
            }, { status: response.status });
        }

        const data = await response.json();

        // Map external data structure to internal Report structure
        const mappedReports = data.map(report => ({
            report_id: report.report_id || report.id,
            user_id: report.user_id,
            user_email: report.user_email,
            product_name: report.product_name,
            product_description: report.user_input,
            hs_code: report.hs_code,
            confidence_score: report.confidence_score,
            status: report.status,
            origin_country: report.origin_country,
            destination_country: report.destination_country,
            manufacturing_country: report.manufacturing_country,
            classification_reasoning: report.hs_reasoning,
            product_characteristics: report.product_characteristics,
            tariff_info: report.tariff_info,
            import_requirements: report.import_requirements,
            official_sources: report.official_sources,
            alternative_codes: report.alternative_codes,
            input_type: report.input_images?.length > 0 ? 'image' : 
                        report.input_files?.length > 0 ? 'file' : 'text',
            file_url: report.input_images?.[0] || report.input_files?.[0],
            created_date: report.created_date
        }));

        return Response.json(mappedReports);
    } catch (error) {
        console.error('Error fetching external reports:', error);
        return Response.json({ 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    }
});