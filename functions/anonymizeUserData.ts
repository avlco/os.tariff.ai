// 📁 File: functions/anonymizeUserData.ts
// [מערכת הניהול - os.tariff.ai]

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * פונקציה פנימית לביצוע אנונימיזציה של נתוני משתמש.
 * המטרה: לשמור על הערך הסטטיסטי (כמה דוחות נוצרו) אך למחוק את הקשר לאדם.
 */
export async function anonymizeUserLogs(userId: string, base44Client: any) {
    console.log(`Starting anonymization for user: ${userId}`);

    try {
        // 1. יצירת מזהה אנונימי (Hash) בלתי הפיך
        const encoder = new TextEncoder();
        const data = encoder.encode(userId + "deleted-salt");
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const anonymousId = "deleted_" + Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('').slice(0, 12);

        // 2. עדכון טבלת אירועי אנליטיקה
        // אנו שולפים את כל האירועים של המשתמש והופכים אותם לאנונימיים
        const events = await base44Client.asServiceRole.entities.AnalyticsEvent.filter({ 
            userId: userId 
        });

        // עדכון ב-Batch (או בלולאה אם ה-SDK לא תומך בעדכון המוני)
        const updatePromises = events.map((event: any) => 
            base44Client.asServiceRole.entities.AnalyticsEvent.update(event.id, {
                userId: anonymousId,
                appUserId: anonymousId,
                ipAddress: '0.0.0.0', // מחיקת IP
                metadata: {
                    ...event.metadata,
                    anonymized: true,
                    original_deleted_date: new Date().toISOString()
                }
            })
        );

        await Promise.all(updatePromises);
        
        console.log(`Successfully anonymized ${events.length} events for user ${userId}`);
        return { success: true, anonymousId };

    } catch (error: any) {
        console.error('Anonymization failed:', error);
        throw error;
    }
}

// Endpoint לבדיקה (אופציונלי, נדרש ע"י Deno)
export default Deno.serve(async (req) => {
    return Response.json({ message: "Internal utility function" });
});
