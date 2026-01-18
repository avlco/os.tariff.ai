// functions/utils/events.ts
// Event Schema אחיד – כל אירוע מה‑app מגיע בפורמט הזה ל‑os

export interface EventBase {
  eventId: string; // UUID ייחודי
  timestamp: number; // Unix timestamp ב‑UTC
  eventType: EventType;
  actor: {
    userId: string; // UUID של המשתמש ב‑app
    sessionId?: string; // session ID אם קיים
    isAdmin?: boolean; // האם admin
  };
  context: {
    ipAddress: string;
    userAgent: string;
    origin: string; // app.tariff-ai.com
    appVersion: string;
  };
  payload: Record<string, any>; // תוכן ספציפי לאירוע
}

export type EventType =
  // Authentication & User Management
  | 'USER_SIGNED_UP'
  | 'USER_LOGIN_SUCCESS'
  | 'USER_LOGIN_FAILED'
  | 'USER_LOGOUT'
  | 'ACCOUNT_DELETION_REQUESTED'
  | 'ACCOUNT_DELETED'
  
  // Classification & Reports
  | 'CLASSIFICATION_STARTED'
  | 'CLASSIFICATION_COMPLETED'
  | 'REPORT_GENERATED'
  | 'REPORT_SHARED'
  | 'REPORT_DOWNLOADED'
  
  // Business Operations
  | 'BULK_UPLOAD_STARTED'
  | 'BULK_UPLOAD_COMPLETED'
  | 'SHIPMENT_ANALYSIS_STARTED'
  | 'SHIPMENT_ANALYSIS_COMPLETED'
  
  // Errors & Security
  | 'AUTHENTICATION_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'API_KEY_ERROR'
  | 'SECURITY_VIOLATION';

export const EVENT_RETENTION_POLICY: Record<EventType, number> = {
  // נתונים מזהים – 90 יום מקסימום
  'USER_SIGNED_UP': 90,
  'USER_LOGIN_SUCCESS': 90,
  'USER_LOGIN_FAILED': 365, // אבטחה
  'USER_LOGOUT': 90,
  'ACCOUNT_DELETION_REQUESTED': 365,
  'ACCOUNT_DELETED': 365,
  
  // דוחות – 180 יום Raw, אחר כך Analytics
  'CLASSIFICATION_STARTED': 180,
  'CLASSIFICATION_COMPLETED': 180,
  'REPORT_GENERATED': 180,
  'REPORT_SHARED': 180,
  'REPORT_DOWNLOADED': 180,
  
  // Bulk & Analysis – 180 יום
  'BULK_UPLOAD_STARTED': 180,
  'BULK_UPLOAD_COMPLETED': 180,
  'SHIPMENT_ANALYSIS_STARTED': 180,
  'SHIPMENT_ANALYSIS_COMPLETED': 180,
  
  // Errors – 365 יום לצורכי אבטחה
  'AUTHENTICATION_ERROR': 365,
  'RATE_LIMIT_EXCEEDED': 365,
  'API_KEY_ERROR': 365,
  'SECURITY_VIOLATION': 365,
};

export function generateEventId(): string {
  return crypto.randomUUID();
}

export function isValidEvent(event: any): event is EventBase {
  return (
    typeof event.eventId === 'string' &&
    typeof event.timestamp === 'number' &&
    typeof event.eventType === 'string' &&
    typeof event.actor === 'object' &&
    typeof event.actor.userId === 'string' &&
    typeof event.context === 'object' &&
    typeof event.context.ipAddress === 'string'
  );
}
