// functions/events/ingestEvent.ts
// Endpoint לקליטת אירועים מ‑app.tariff-ai.com

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
    if (!authHeader || authHeader !== `Bearer ${Deno.env.get('TAIRFFAI_APP_API_KEY')}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const event: EventBase = await req.json();
    
    // ולידציה
    if (!isValidEvent(event)) {
      return new Response(JSON.stringify({ error: 'Invalid event schema' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // חיבור ל‑Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // שמירת Raw Event בטבלה events_raw
    const { error: rawError } = await supabase
      .from('events_raw')
      .insert(event);

    if (rawError) {
      console.error('Raw event save failed:', rawError);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // יצירת Analytics Event (ללא PII ישיר)
    const analyticsEvent = {
      ...event,
      actor: {
        userIdHash: await hashUserId(event.actor.userId), // hash חד‑כיווני
        isAdmin: event.actor.isAdmin,
      },
      ipAddress: await hashIp(event.context.ipAddress), // hash IP
    };

    // שמירה ב‑events_analytics
    const { error: analyticsError } = await supabase
      .from('events_analytics')
      .insert(analyticsEvent);

    if (analyticsError) {
      console.error('Analytics event save failed:', analyticsError);
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      action: 'EVENT_INGESTED',
      details: { eventType: event.eventType, userId: event.actor.userId },
      ip: event.context.ipAddress,
    });

    return new Response(JSON.stringify({ success: true, eventId: event.eventId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Event ingestion error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// פונקציות עזר להצפנה / hash
async function hashUserId(userId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(userId + Deno.env.get('TAIRFFAI_APP_API_KEY'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return btoa(String.fromCharCode(...hashArray)).replace(/=/g, '').slice(0, 32);
}

async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return btoa(String.fromCharCode(...hashArray)).replace(/=/g, '').slice(0, 32);
}
