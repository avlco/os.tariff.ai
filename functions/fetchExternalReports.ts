// 📁 File: functions/fetchExternalReports.ts
// [מערכת הניהול - os.tariff.ai]
import { withAuth } from './auth/middleware.ts';
import { Permission } from './auth/types.ts';
import { decrypt } from './utils/encryption.ts'; // ✅ ייבוא מנוע ההצפנה

export default Deno.serve(withAuth(async (req, user, base44) => {
    try {
        const apiKey = Deno.env.get("TARIFFAI_APP_API_KEY");
        if (!apiKey) {
            return Response.json({ error: 'API key not configured' }, { status: 500 });
        }

        // שליפת הנתונים מהאפליקציה
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

        // ✅ שימוש ב-Promise.all כדי לפענח שדות רגישים במקביל
        const mappedReports = await Promise.all(data.map(async (report: any) => ({
            id: report.id,
            report_id: report.report_id || report.id,
            user_id: report.created_by,
            
            // 🔐 שדות רגישים שמפענחים (אם הם לא מוצפנים, הפונקציה תחזיר אותם כמו שהם)
            user_email: await decrypt(report.created_by), 
            product_name: await decrypt(report.product_name),
            product_description: await decrypt(report.user_input_text),
            classification_reasoning: await decrypt(report.classification_reasoning),
            tariff_info: await decrypt(report.tariff_description),
            
            // שדות רגילים
            hs_code: report.hs_code,
            confidence_score: report.confidence_score,
            status: report.status,
            origin_country: report.country_of_origin,
            destination_country: report.destination_country,
            manufacturing_country: report.country_of_manufacture,
            product_characteristics: report.product_characteristics,
            import_requirements: report.import_requirements,
            official_sources: report.official_sources,
            alternative_codes: report.alternative_classifications,
            input_type: report.user_input_files?.length > 0 ? 'file' : 'text',
            file_url: report.user_input_files?.[0],
            created_date: report.created_date
        })));

        return Response.json(mappedReports);
    } catch (error: any) {
        console.error('Error fetching external reports:', error);
        return Response.json({ 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    }
}, Permission.VIEW_ALL_REPORTS));
