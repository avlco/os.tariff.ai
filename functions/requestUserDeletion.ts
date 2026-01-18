// 📁 File: functions/requestUserDeletion.ts
// [מערכת הניהול - os.tariff.ai]

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * פונקציה פנימית לביצוע אנונימיזציה של נתוני משתמש.
 * המטרה: לשמור על הערך הסטטיסטי (כמה דוחות נוצרו) אך למחוק את הקשר לאדם.
 */
async function anonymizeUserLogs(userId, base44Client) {
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
        const updatePromises = events.map((event) => 
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

    } catch (error) {
        console.error('Anonymization failed:', error);
        throw error;
    }
}

// Main handler
export default Deno.serve(async (req) => {
    try {
        // 1. אבטחה: אימות API Key (Server-to-Server)
        // נוודא שהבקשה מגיעה מהאפליקציה שלנו ולא מסתם מישהו
        const authHeader = req.headers.get('Authorization');
        const expectedKey = Deno.env.get('TARIFFAI_APP_API_KEY'); 
        
        if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
            console.warn('Unauthorized deletion request - Invalid API Key');
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await req.json();
        if (!userId) {
            return Response.json({ error: 'User ID required' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);

        // 2. ביצוע האנונימיזציה ב-OS
        await anonymizeUserLogs(userId, base44);

        return Response.json({ 
            success: true, 
            message: 'User data anonymized successfully in OS' 
        });

    } catch (error) {
        console.error('Error handling deletion request:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});