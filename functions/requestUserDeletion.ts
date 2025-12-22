import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Mark user as requesting deletion (soft delete)
        await base44.entities.User.update(user.id, {
            is_deleted: true,
            deletion_requested_at: new Date().toISOString()
        });

        // Send notification email to admin
        const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
        if (adminEmail) {
            try {
                await base44.integrations.Core.SendEmail({
                    to: adminEmail,
                    subject: 'User Deletion Request',
                body: `
                    User has requested account deletion:
                    
                    User ID: ${user.id}
                    Email: ${user.email}
                    Name: ${user.full_name}
                    Requested At: ${new Date().toISOString()}
                    
                    Please review and process this request through the admin panel.
                    Use the anonymizeUserData function to complete the anonymization process.
                `
                });
            } catch (emailError) {
                console.error('Failed to send admin notification:', emailError);
            }
        }

        return Response.json({
            success: true,
            message: 'Your deletion request has been received. Your account will be processed within 30 days as per GDPR/LGPD requirements.',
            deletion_requested_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error requesting user deletion:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});