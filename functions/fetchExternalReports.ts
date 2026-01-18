// 📁 File: functions/fetchExternalReports.ts
import { withAuth } from './auth/middleware.ts';
import { Permission } from './auth/types.ts';

export default Deno.serve(withAuth(async (req, user, base44) => {
    try {
        const apiKey = Deno.env.get("TAIRFFAI_APP_API_KEY");
        if (!apiKey) {
            return Response.json({ error: 'API key not configured' }, { status: 500 });
        }

        // Fetch ClassificationReport entities from external app
        const response = await fetch(
            `https://app.base44.com/api/apps/6944f7300c31b18399592a2a/entities/ClassificationReport`,
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

        const mappedReports = data.map((report: any) => ({
            id: report.id,
            report_id: report.report_id || report.id,
            user_id: report.created_by,
            user_email: report.created_by,
            product_name: report.product_name,
            product_description: report.user_input_text,
            hs_code: report.hs_code,
            confidence_score: report.confidence_score,
            status: report.status,
            origin_country: report.country_of_origin,
            destination_country: report.destination_country,
            manufacturing_country: report.country_of_manufacture,
            classification_reasoning: report.classification_reasoning,
            product_characteristics: report.product_characteristics,
            tariff_info: report.tariff_description,
            import_requirements: report.import_requirements,
            official_sources: report.official_sources,
            alternative_codes: report.alternative_classifications,
            input_type: report.user_input_files?.length > 0 ? 'file' : 'text',
            file_url: report.user_input_files?.[0],
            created_date: report.created_date
        }));

        return Response.json(mappedReports);
    } catch (error: any) {
        console.error('Error fetching external reports:', error);
        return Response.json({ 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    }
}, Permission.VIEW_ALL_REPORTS));
