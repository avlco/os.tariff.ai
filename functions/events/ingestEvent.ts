// functions/events/ingestEvent.ts
// Endpoint לקליטת אירועים מ‑app.tariff-ai.com
// ✅ משתמש ב‑AnalyticsEvent Entity הקיים

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { EventBase, isValidEvent, EVENT_RETENTION_POLICY } from '../utils/events.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // אימות API Key מה‑app
    const authHeader = req.headers.get('Authorization');
    const expectedKey = `Bearer ${Deno.env.get('TARIFFAI_APP_API_KEY')}`;
    
    if (!authHeader || authHeader !== expectedKey) {
      console.warn('Unauthorized access attempt');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const event: EventBase = await req.json();
    
    // ולידציה
    if (!isValidEvent(event)) {
      console.error('Invalid event schema:', event);
      return new Response(JSON.stringify({ 
        error: 'Invalid event schema',
        details: 'Event must include: eventId, timestamp, eventType, actor, context, payload'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // חיבור ל‑Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // ✅ מיפוי ל‑AnalyticsEvent Entity הקיים
    const analyticsEvent = {
      id: event.eventId,
      createdAt: new Date(event.timestamp).toISOString(),
      eventType: event.eventType,
      userId: event.actor.userId,
      appUserId: event.actor.appUserId || null,
      sessionId: event.actor.sessionId || null,
      
      // Context fields
      ipAddress: await hashIp(event.context.ipAddress), // hash לפרטיות
      userAgent: event.context.userAgent,
      origin: event.context.origin,
      appVersion: event.context.appVersion,
      
      // Payload - נשמר כ‑JSONB
      metadata: {
        ...event.payload,
        originalIpHash: await hashIp(event.context.ipAddress),
      },
      
      // Retention
      retentionDays: EVENT_RETENTION_POLICY[event.eventType],
      expiresAt: calculateExpirationDate(event.timestamp, event.eventType),
    };

    // ✅ שמירה ב‑AnalyticsEvent (Entity קיים!)
    const { data, error: insertError } = await supabase
      .from('AnalyticsEvent')
      .insert(analyticsEvent)
      .select()
      .single();

    if (insertError) {
      console.error('AnalyticsEvent insert failed:', insertError);
      return new Response(JSON.stringify({ 
        error: 'Failed to save event',
        details: insertError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ✅ Audit log (אופציונלי - אם יש לך AuditLog Entity)
    try {
      await supabase.from('AuditLog').insert({
        action: 'EVENT_INGESTED',
        entityType: 'AnalyticsEvent',
        entityId: event.eventId,
        userId: event.actor.userId,
        metadata: { 
          eventType: event.eventType,
          origin: event.context.origin 
        },
        ipAddress: event.context.ipAddress,
        createdAt: new Date().toISOString(),
      });
    } catch (auditError) {
      // לא קריטי - רק לוג
      console.warn('Audit log failed (non-critical):', auditError);
    }

    console.log(`✅ Event ingested: ${event.eventType} (${event.eventId})`);

    return new Response(JSON.stringify({ 
      success: true, 
      eventId: event.eventId,
      storedAt: data.createdAt,
      expiresAt: data.expiresAt,
    }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Event ingestion error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ✅ פונקציות עזר

/** חישוב תאריך תפוגה לפי Retention Policy */
function calculateExpirationDate(timestamp: number, eventType: EventType): string {
  const retentionDays = EVENT_RETENTION_POLICY[eventType];
  const expirationDate = new Date(timestamp + (retentionDays * 24 * 60 * 60 * 1000));
  return expirationDate.toISOString();
}

/** Hash של IP לשמירת פרטיות */
async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = Deno.env.get('IP_HASH_SALT') || 'default-salt-change-me';
  const data = encoder.encode(ip + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

/** Hash של User ID (אם צריך) */
async function hashUserId(userId: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = Deno.env.get('USER_HASH_SALT') || Deno.env.get('TARIFFAI_APP_API_KEY') || '';
  const data = encoder.encode(userId + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}
