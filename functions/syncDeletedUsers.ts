// 📁 File: functions/syncDeletedUsers.ts
// [מערכת הניהול - os.tariff.ai]

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { anonymizeUserLogs } from './anonymizeUserData.ts';

// פונקציה זו נועדה לרוץ כ-Scheduled Task (למשל פעם בשעה)
// היא "מושכת" מהאפליקציה משתמשים שנמחקו ומנקה את הלוגים שלהם ב-OS
export default Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        console.log('Starting sync of deleted users...');

        // 1. שליפת משתמשים "מחוקים" מבסיס הנתונים של האפליקציה
        // מכיוון שה-OS ומערכת האפליקציה חולקים תשתית (או שה-OS הוא Admin),
        // אנו נחפש משתמשים לפי התבנית שהגדרנו במחיקה
        
        // הערה: אם ל-OS אין גישה ישירה ל-DB של ה-App, יש להשתמש ב-fetch ל-API של ה-App.
        // בהנחה שהם באותו Workspace או שיש ל-OS הרשאות רחבות:
        const deletedUsers = await base44.asServiceRole.entities.User.filter({
            last_name: 'User',
            first_name: 'Deleted'
        });

        console.log(`Found ${deletedUsers.length} deleted users candidates`);

        let processedCount = 0;

        // 2. מעבר על המשתמשים וביצוע אנונימיזציה ב-OS
        for (const user of deletedUsers) {
            // אנונימיזציה של הלוגים ב-OS (הפונקציה שיצרנו קודם)
            await anonymizeUserLogs(user.id, base44);
            processedCount++;
        }

        return Response.json({ 
            success: true, 
            processed: processedCount 
        });

    } catch (error: any) {
        console.error('Error syncing deleted users:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
