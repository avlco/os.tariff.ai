// 📁 File: functions/requestUserDeletion.ts
// [מערכת הניהול - os.tariff.ai]

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { anonymizeUserLogs } from './anonymizeUserData.ts';

export default Deno.serve(async (req) => {
    try {
        // 1. אבטחה: אימות API Key (Server-to-Server)
        // נוודא שהבקשה מגיעה מהאפליקציה שלנו ולא מסתם מישהו
        const authHeader = req.headers.get('Authorization');
        const expectedKey = Deno.env.get('TAIRFFAI_APP_API_KEY'); 
        
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

    } catch (error: any) {
        console.error('Error handling deletion request:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
