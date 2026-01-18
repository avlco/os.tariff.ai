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
  } & Record<string, any>;
}

export type EventType = 
  // מתאים ל‑Entities שלך
  | 'USER_LOGIN_SUCCESS'
  | 'USER_LOGIN_FAILED'
  | 'REPORT_GENERATED'
  | 'SHIPMENT_ANALYSIS_STARTED'
  | 'PAYMENT_SUCCESS'
  | 'SUPPORT_TICKET_CREATED'
  | 'ACCOUNT_DELETION_REQUESTED'

// Retention policy לפי ה‑Entities שלך
export const EVENT_RETENTION_POLICY: Record<EventType, number> = {
  'USER_LOGIN_SUCCESS': 90,
  'USER_LOGIN_FAILED': 365,
  'REPORT_GENERATED': 180,
  'SHIPMENT_ANALYSIS_STARTED': 180,
  'PAYMENT_SUCCESS': 365,
  'SUPPORT_TICKET_CREATED': 365,
  'ACCOUNT_DELETION_REQUESTED': 365,
};
