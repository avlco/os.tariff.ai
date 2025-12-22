import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
        }

        const { user_id } = await req.json();
        
        if (!user_id) {
            return Response.json({ error: 'user_id is required' }, { status: 400 });
        }

        // Get the user to anonymize
        const users = await base44.asServiceRole.entities.User.filter({ id: user_id });
        
        if (!users || users.length === 0) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        const userToAnonymize = users[0];

        // Check if already anonymized
        if (userToAnonymize.anonymized_at) {
            return Response.json({ 
                message: 'User already anonymized',
                anonymized_at: userToAnonymize.anonymized_at 
            });
        }

        // Create hash of original email for potential recovery/verification
        const emailHash = await crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(userToAnonymize.email + Deno.env.get('BASE44_APP_ID'))
        );
        const emailHashHex = Array.from(new Uint8Array(emailHash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        // Anonymize the user data
        const anonymizedData = {
            email: `deleted_${user_id}@anonymized.local`,
            full_name: 'Deleted User',
            is_deleted: true,
            anonymized_at: new Date().toISOString(),
            original_email_hash: emailHashHex,
            // Keep other non-PII fields as is
            role: userToAnonymize.role,
            plan: userToAnonymize.plan
        };

        // Update the user with anonymized data
        await base44.asServiceRole.entities.User.update(user_id, anonymizedData);

        return Response.json({
            success: true,
            message: 'User data anonymized successfully',
            user_id,
            anonymized_at: anonymizedData.anonymized_at
        });

    } catch (error) {
        console.error('Error anonymizing user data:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});