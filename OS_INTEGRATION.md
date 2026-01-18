# 🔗 OS System Integration for Soft Delete

## 🎯 Overview

This document describes how the OS (Operating System) integrates with the app's soft delete mechanism.

---

## 📊 Architecture

```
App (app.tariff-ai.com)          OS (os.tariff-ai.com)
       │                                  │
       │  1. User requests deletion      │
       │  requestAccountDeletion()       │
       ├─────────────────────────────────>│
       │                                  │ requestUserDeletion()
       │                                  │ - Mark analytics for deletion
       │                                  │ - DON'T anonymize yet
       │<─────────────────────────────────┤
       │  2. Success response             │
       │                                  │
       │  ... 30 days grace period ...   │
       │                                  │
       │  3a. User logs in (restore)     │
       │  restoreDeletedAccount()        │
       ├─────────────────────────────────>│
       │                                  │ restoreUserAccount()
       │                                  │ - Remove deletion markers
       │                                  │ - Restore analytics
       │<─────────────────────────────────┤
       │                                  │
       │  3b. OR: 30 days pass (CRON)   │
       │  executeScheduledDeletions()    │
       ├─────────────────────────────────>│
       │                                  │ anonymizeUserData()
       │                                  │ - Hard delete analytics
       │                                  │ - Anonymize user ID
       │<─────────────────────────────────┤
```

---

## 🛠️ Updated Functions

### 1. `requestUserDeletion.ts` (Updated)

**Purpose**: Mark analytics for deletion (soft delete)

**Changes**:
- ❌ **Old**: Immediately anonymized analytics
- ✅ **New**: Only marks events with `metadata.marked_for_deletion = true`

**Input**:
```json
{
  "userId": "user-id-here",
  "scheduledDeletion": "2026-02-17T00:00:00Z"
}
```

**Output**:
```json
{
  "success": true,
  "message": "Analytics marked for deletion in OS",
  "scheduled_deletion": "2026-02-17T00:00:00Z",
  "events_affected": 42
}
```

### 2. `restoreUserAccount.ts` (NEW)

**Purpose**: Restore analytics when user recovers account

**Input**:
```json
{
  "userId": "user-id-here"
}
```

**Output**:
```json
{
  "success": true,
  "message": "Analytics restored in OS",
  "events_restored": 42
}
```

**What it does**:
- Finds all analytics events with `marked_for_deletion = true`
- Removes deletion markers
- Adds `restored_at` timestamp

### 3. `anonymizeUserData.ts` (Existing)

**Purpose**: Hard delete analytics after 30 days

**Called by**: App's CRON job (`executeScheduledDeletions`)

**What it does**:
- Creates anonymous hash ID
- Anonymizes all analytics events
- Changes userId to `deleted_xxxxx`
- Sets IP to `0.0.0.0`

---

## 🔐 Authentication

All OS functions require server-to-server authentication:

```typescript
Headers:
  Authorization: Bearer <TAIRFFAI_APP_API_KEY>
```

**Environment Variable**: `TAIRFFAI_APP_API_KEY`

---

## 📊 Data Flow Examples

### Scenario 1: Soft Delete (Day 0)

#### App Side:
```typescript
// User clicks delete
await base44.functions.invoke('requestAccountDeletion');
// → Marks user as pending_deletion
// → Calls OS...
```

#### OS Side:
```typescript
// OS receives notification
await markAnalyticsForDeletion(userId, scheduledDate);
// Updates AnalyticsEvent:
// metadata: {
//   marked_for_deletion: true,
//   deletion_scheduled_for: "2026-02-17",
//   deletion_marked_at: "2026-01-18"
// }
```

**Result**: Analytics events marked but NOT anonymized

### Scenario 2: User Restores (Day 5)

#### App Side:
```typescript
// User logs in
await base44.functions.invoke('restoreDeletedAccount');
// → Restores user status
// → Calls OS...
```

#### OS Side:
```typescript
// OS receives restore notification
await restoreAnalytics(userId);
// Updates AnalyticsEvent:
// metadata: {
//   restored_at: "2026-01-23"
//   // marked_for_deletion removed
// }
```

**Result**: Analytics fully restored

### Scenario 3: Hard Delete (Day 30)

#### App Side:
```typescript
// CRON job runs
await fetch('https://os.tariff-ai.com/functions/anonymizeUserData', {
  method: 'POST',
  body: JSON.stringify({ userId })
});
```

#### OS Side:
```typescript
// OS performs hard delete
await anonymizeUserLogs(userId);
// Updates AnalyticsEvent:
// userId: "deleted_a1b2c3d4e5f6",
// appUserId: "deleted_a1b2c3d4e5f6",
// ipAddress: "0.0.0.0",
// metadata: {
//   anonymized: true,
//   original_deleted_date: "2026-02-17"
// }
```

**Result**: All analytics permanently anonymized

---

## ⚙️ Configuration

### Environment Variables

Add to OS system:

```bash
TAIRFFAI_APP_API_KEY=<shared-secret-key>
```

**Important**: This must match the `TARIFFAI_APP_API_KEY` in the App system.

---

## 🧪 Testing

### Test Soft Delete Notification

```bash
curl -X POST https://os.tariff-ai.com/functions/requestUserDeletion \
  -H "Authorization: Bearer <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "scheduledDeletion": "2026-02-17T00:00:00Z"
  }'
```

**Expected**: `{"success": true, "events_affected": X}`

### Test Restore Notification

```bash
curl -X POST https://os.tariff-ai.com/functions/restoreUserAccount \
  -H "Authorization: Bearer <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id"}'
```

**Expected**: `{"success": true, "events_restored": X}`

### Test Hard Delete

```bash
curl -X POST https://os.tariff-ai.com/functions/anonymizeUserData \
  -H "Authorization: Bearer <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id"}'
```

**Expected**: `{"success": true, "anonymousId": "deleted_xxxxx"}`

---

## 📝 Deployment Checklist

- [ ] Update `requestUserDeletion.ts` with soft delete logic
- [ ] Create `restoreUserAccount.ts` function
- [ ] Verify `anonymizeUserData.ts` is unchanged
- [ ] Set `TAIRFFAI_APP_API_KEY` environment variable
- [ ] Test all three endpoints
- [ ] Monitor logs for errors

---

## 🔍 Monitoring

### Check Marked Events

```javascript
const markedEvents = await base44.entities.AnalyticsEvent.filter({
  'metadata.marked_for_deletion': true
});

console.log(`${markedEvents.length} events pending deletion`);
```

### Check Restored Events

```javascript
const restoredEvents = await base44.entities.AnalyticsEvent.filter({
  'metadata.restored_at': { $ne: null }
});

console.log(`${restoredEvents.length} events were restored`);
```

### Check Anonymized Events

```javascript
const anonymizedEvents = await base44.entities.AnalyticsEvent.filter({
  'metadata.anonymized': true
});

console.log(`${anonymizedEvents.length} events anonymized`);
```

---

## ❗ Important Notes

1. **Backwards Compatible**: Existing `anonymizeUserData` function unchanged
2. **Graceful Degradation**: If OS call fails, app deletion continues
3. **Idempotent**: Safe to call multiple times
4. **No Breaking Changes**: Can be deployed independently

---

**Last Updated**: January 18, 2026  
**Version**: 1.0.0  
**Status**: ✅ Ready for Deployment
