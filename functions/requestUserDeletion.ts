// 📁 File: functions/requestUserDeletion.ts
// [מערכת הניהול - os.tariff.ai]
// פונקציה לקבלת הודעות על בקשות מחיקה מהאפליקציה

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * פונקציה פנימית לסימון אירועי אנליטיקה למחיקה (Soft Delete)
 * לא מוחקים מייד - רק מסמנים למחיקה
 */
async function markAnalyticsForDeletion(userId, scheduledDate, base44Client) {
    console.log(`Marking analytics for deletion: ${userId}, scheduled for ${scheduledDate}`);

    try {
        // שליפת כל האירועים של המשתמש
        const events = await base44Client.asServiceRole.entities.AnalyticsEvent.filter({ 
            userId: userId 
        });

        // סימון ב-metadata בלבד - לא אנונימיזציה!
        const updatePromises = events.map((event) => 
            base44Client.asServiceRole.entities.AnalyticsEvent.update(event.id, {
                metadata: {
                    ...event.metadata,
                    marked_for_deletion: true,
                    deletion_scheduled_for: scheduledDate,
                    deletion_marked_at: new Date().toISOString()
                }
            })
        );

        await Promise.all(updatePromises);
        
        console.log(`Successfully marked ${events.length} events for deletion`);
        return { success: true, events_marked: events.length };

    } catch (error) {
        console.error('Failed to mark events for deletion:', error);
        throw error;
    }
}

// Main handler
export default Deno.serve(async (req) => {
    try {
        // 1. אבטחה: אימות API Key (Server-to-Server)
        const authHeader = req.headers.get('Authorization');
        const expectedKey = Deno.env.get('TAIRFFAI_APP_API_KEY'); 
        
        if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
            console.warn('Unauthorized deletion request - Invalid API Key');
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, scheduledDeletion } = await req.json();
        if (!userId) {
            return Response.json({ error: 'User ID required' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);

        // 2. סימון למחיקה (Soft Delete) - לא אנונימיזציה!
        const result = await markAnalyticsForDeletion(userId, scheduledDeletion, base44);

        return Response.json({ 
            success: true, 
            message: 'Analytics marked for deletion in OS',
            scheduled_deletion: scheduledDeletion,
            events_affected: result.events_marked
        });

    } catch (error) {
        console.error('Error handling deletion request:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
