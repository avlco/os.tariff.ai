// functions/utils/events.ts – מעודכן ל‑Entities הקיימים
export interface EventBase {
  eventId: string;
  timestamp: number;
  eventType: EventType;
  actor: {
    userId: string; 
    sessionId?: string;
    appUserId?: string; // קיים אצלך ב‑AppUser
  };
  context: {
    ipAddress: string;
    userAgent: string;
    origin: string;
    appVersion: string;
  };
  payload: {
    reportId?: string; // קיים אצלך
    shipmentId?: string; // קיים אצלך
    paymentId?: string; // קיים אצלך
    supportTicketId?: string;
  } & Record<string, any>;
}

export type EventType = 
  | 'USER_LOGIN_SUCCESS'
  | 'USER_LOGIN_FAILED'
  | 'REPORT_GENERATED'
  | 'REPORT_VIEWED'
  | 'SHIPMENT_ANALYSIS_STARTED'
  | 'SHIPMENT_ANALYSIS_COMPLETED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'SUPPORT_TICKET_CREATED'
  | 'SUPPORT_TICKET_UPDATED'
  | 'ACCOUNT_DELETION_REQUESTED'
  | 'ACCOUNT_CREATED'
  | 'PAGE_VIEW'
  | 'USER_ACTION';

// Retention policy לפי ה‑Entities שלך (בימים)
export const EVENT_RETENTION_POLICY: Record<EventType, number> = {
  'USER_LOGIN_SUCCESS': 90,
  'USER_LOGIN_FAILED': 365,
  'REPORT_GENERATED': 180,
  'REPORT_VIEWED': 90,
  'SHIPMENT_ANALYSIS_STARTED': 180,
  'SHIPMENT_ANALYSIS_COMPLETED': 180,
  'PAYMENT_SUCCESS': 2555, // 7 שנים (דרישה חוקית)
  'PAYMENT_FAILED': 365,
  'SUPPORT_TICKET_CREATED': 365,
  'SUPPORT_TICKET_UPDATED': 365,
  'ACCOUNT_DELETION_REQUESTED': 2555, // 7 שנים (דרישה חוקית)
  'ACCOUNT_CREATED': 365,
  'PAGE_VIEW': 30,
  'USER_ACTION': 90,
};

// ✅ פונקציית ולידציה
export function isValidEvent(event: any): event is EventBase {
  if (!event || typeof event !== 'object') return false;
  
  // בדיקות בסיסיות
  if (typeof event.eventId !== 'string' || !event.eventId) return false;
  if (typeof event.timestamp !== 'number' || event.timestamp <= 0) return false;
  if (!EVENT_RETENTION_POLICY.hasOwnProperty(event.eventType)) return false;
  
  // בדיקת actor
  if (!event.actor || typeof event.actor !== 'object') return false;
  if (typeof event.actor.userId !== 'string' || !event.actor.userId) return false;
  
  // בדיקת context
  if (!event.context || typeof event.context !== 'object') return false;
  if (typeof event.context.ipAddress !== 'string') return false;
  if (typeof event.context.userAgent !== 'string') return false;
  if (typeof event.context.origin !== 'string') return false;
  if (typeof event.context.appVersion !== 'string') return false;
  
  // בדיקת payload
  if (!event.payload || typeof event.payload !== 'object') return false;
  
  return true;
}
