// functions/utils/dbEvents.ts
// פונקציות DB לניהול אירועים

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function ensureEventsTables() {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  // טבלה Raw Events
  await supabase.rpc('create_events_raw_table');

  // טבלה Analytics Events  
  await supabase.rpc('create_events_analytics_table');

  // טבלת Audit Logs
  await supabase.rpc('create_audit_logs_table');

  // RLS Policies
  await supabase.rpc('setup_events_rls_policies');
}

export async function enforceRetentionPolicy() {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  // מחיקת Raw events ישנים
  await supabase.rpc('cleanup_old_raw_events');
  
  // המרה לאנליטיקה אם צריך
  await supabase.rpc('archive_to_analytics');
}
