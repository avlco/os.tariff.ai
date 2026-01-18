// 📁 File: functions/auth/middleware.ts
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Permission, AuthenticatedUser } from './types.ts';
import { hasPermission } from './rbac.ts';

type ProtectedHandler = (
  req: Request, 
  user: AuthenticatedUser,
  base44: any
) => Promise<Response>;

export function withAuth(
  handler: ProtectedHandler, 
  requiredPermission?: Permission
) {
  return async (req: Request): Promise<Response> => {
    // 1. CORS Preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', { 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        } 
      });
    }

    try {
      // 2. יצירת קליינט Base44
      const base44 = createClientFromRequest(req);
      
      // 3. אימות משתמש
      const user = await base44.auth.me();
      
      if (!user) {
        console.warn('Unauthorized access attempt');
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // 4. בדיקת הרשאות (RBAC)
      if (requiredPermission) {
        if (!hasPermission(user.role, requiredPermission)) {
          console.warn(`Forbidden: User ${user.id} (Role: ${user.role}) missing ${requiredPermission}`);
          return Response.json({ 
            error: 'Forbidden: Insufficient permissions' 
          }, { status: 403 });
        }
      }

      // 5. הרצת הלוגיקה העסקית
      return await handler(req, user, base44);

    } catch (err) {
      console.error('Auth Middleware Error:', err);
      return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  };
}
