// 📁 File: functions/restoreUserAccount.ts
// [מערכת הניהול - os.tariff.ai]
// פונקציה לשחזור אירועי אנליטיקה של משתמש ששוחזר

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * שחזור אירועים שסומנו למחיקה
 */
async function restoreAnalytics(userId, base44Client) {
    console.log(`Restoring analytics for user: ${userId}`);

    try {
        // מציאת אירועים שסומנו למחיקה
        const events = await base44Client.asServiceRole.entities.AnalyticsEvent.filter({ 
            userId: userId 
        });

        // סינון אירועים עם סימון מחיקה
        const markedEvents = events.filter(event => 
            event.metadata?.marked_for_deletion === true
        );

        if (markedEvents.length === 0) {
            console.log('No marked events found - nothing to restore');
            return { success: true, events_restored: 0 };
        }

        // הסרת סימוני המחיקה
        const updatePromises = markedEvents.map((event) => {
            const cleanMetadata = { ...event.metadata };
            delete cleanMetadata.marked_for_deletion;
            delete cleanMetadata.deletion_scheduled_for;
            delete cleanMetadata.deletion_marked_at;
            
            // הוספת תיאום שחזור
            cleanMetadata.restored_at = new Date().toISOString();
            
            return base44Client.asServiceRole.entities.AnalyticsEvent.update(event.id, {
                metadata: cleanMetadata
            });
        });

        await Promise.all(updatePromises);
        
        console.log(`Successfully restored ${markedEvents.length} events`);
        return { success: true, events_restored: markedEvents.length };

    } catch (error) {
        console.error('Failed to restore analytics:', error);
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
            console.warn('Unauthorized restore request - Invalid API Key');
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await req.json();
        if (!userId) {
            return Response.json({ error: 'User ID required' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);

        // 2. שחזור אירועי אנליטיקה
        const result = await restoreAnalytics(userId, base44);

        return Response.json({ 
            success: true, 
            message: 'Analytics restored in OS',
            events_restored: result.events_restored
        });

    } catch (error) {
        console.error('Error handling restore request:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
