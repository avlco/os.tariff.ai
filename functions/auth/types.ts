// 📁 File: functions/auth/types.ts

export type UserRole = 'free' | 'business' | 'enterprise' | 'admin';

export enum Permission {
  // דוחות
  VIEW_OWN_REPORTS = 'reports:view_own',
  VIEW_ALL_REPORTS = 'reports:view_all',
  CREATE_REPORT = 'reports:create',
  DELETE_REPORT = 'reports:delete',
  
  // משלוחים
  VIEW_SHIPMENTS = 'shipments:view',
  CREATE_SHIPMENT = 'shipments:create',
  
  // ניהול
  MANAGE_USERS = 'admin:manage_users',
  VIEW_ANALYTICS = 'admin:view_analytics',
  CONFIGURE_SYSTEM = 'admin:configure',
  
  // Enterprise
  API_ACCESS = 'api:access',
  EXPORT_DATA = 'data:export'
}

// התאמה למבנה המשתמש של Base44
export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
  [key: string]: any;
}
