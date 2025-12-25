# Routing Engine Explanation - Part 5

## How the Routing Engine Works

### Step-by-Step Flow

#### 1. **Submission Created** 
When you submit a form via `/api/submissions`:

```typescript
// In src/app/api/submissions/route.ts (line 158-165)
// After creating the submission, routing is triggered:
const RoutingEngine = (await import("@/services/RoutingEngine")).default;
await RoutingEngine.routeSubmission(submission._id.toString());
```

---

#### 2. **RoutingEngine.routeSubmission() is Called**

The engine does the following:

##### **Step 2.1: Load Submission Data**
```typescript
// Loads submission with template info
const submission = await Submission.findById(submissionId).populate("templateId");

// Extracts:
// - industry: "Construction" (from template)
// - subtype: "Contractor" (from template)  
// - state: "CA" (from submission.state or clientContact.businessAddress.state)
```

**Example:**
- Industry: `"Construction"`
- Subtype: `"Contractor"`
- State: `"CA"`

---

##### **Step 2.2: Find Matching Routing Rules**

The engine searches for rules in **priority order**:

**Priority 1: Exact Match (Industry + Subtype + State)**
```typescript
// Looks for rules matching EXACTLY:
// - industry: "Construction"
// - subtype: "Contractor"  
// - state: "CA"
// - isActive: true

const exactMatchRules = await RoutingRule.find({
  industry: "Construction",
  subtype: "Contractor",
  state: "CA",  // Exact state match
  isActive: true,
}).sort({ priority: 1 }); // Lower number = higher priority
```

**Priority 2: Fallback (Industry + Subtype, No State)**
```typescript
// If no exact match, looks for state-agnostic rules:
// - industry: "Construction"
// - subtype: "Contractor"
// - state: null (applies to all states)

const fallbackRules = await RoutingRule.find({
  industry: "Construction",
  subtype: "Contractor",
  state: null,  // State-agnostic
  isActive: true,
}).sort({ priority: 1 });
```

**Example Routing Rules (from seedRoutingRules.ts):**

| Industry | Subtype | State | Carrier | Priority |
|----------|---------|-------|---------|----------|
| Construction | Contractor | CA | Pacific Insurance Co | 10 (HIGH) |
| Construction | Contractor | null | Golden State Underwriters | 20 (LOW) |

**Result:** For a CA Contractor submission, it finds:
1. ✅ Exact match: Pacific Insurance Co (priority 10)
2. ✅ Fallback: Golden State Underwriters (priority 20)

---

##### **Step 2.3: Check Carrier State Coverage**

For each matching rule, check if the carrier serves that state:

```typescript
// Check if carrier.statesServed includes "CA"
if (carrier.statesServed && !carrier.statesServed.includes("CA")) {
  // Skip this carrier - doesn't serve CA
  await RoutingLog.create({
    status: "FAILED",
    notes: "Carrier does not serve state CA"
  });
  return; // Skip to next carrier
}
```

**Example:**
- Pacific Insurance Co serves: `["CA", "NV", "AZ"]` ✅ Serves CA
- Golden State Underwriters serves: `["CA", "OR", "WA"]` ✅ Serves CA

Both carriers serve CA, so both will receive the submission.

---

##### **Step 2.4: Mock Email Sending**

For each valid carrier, the engine "sends" an email (currently just logs to console):

```typescript
// Mock email (in production, this would use actual email service)
console.log(`📧 Sending email to ${carrier.email} for submission ${submissionId}`);
console.log(`Email content: New submission received - Construction / Contractor in CA`);
console.log(`Submission link: http://localhost:3000/admin/submissions/${submissionId}`);

// In production, you would do:
// await sendEmail({
//   to: carrier.email,
//   subject: "New Insurance Submission: Construction - Contractor",
//   body: `A new submission has been received...`,
//   link: submissionLink
// });
```

**Console Output Example:**
```
[RoutingEngine] Routing submission 507f1f77bcf86cd799439011: Construction / Contractor / CA
[RoutingEngine] 📧 Sending email to pacific@insurance.com for submission 507f1f77bcf86cd799439011
[RoutingEngine] Email content: New submission received - Construction / Contractor in CA
[RoutingEngine] Submission link: http://localhost:3000/admin/submissions/507f1f77bcf86cd799439011
[RoutingEngine] ✅ Successfully routed submission 507f1f77bcf86cd799439011 to carrier Pacific Insurance Co
[RoutingEngine] 📧 Sending email to golden@insurance.com for submission 507f1f77bcf86cd799439011
[RoutingEngine] ✅ Successfully routed submission 507f1f77bcf86cd799439011 to carrier Golden State Underwriters
```

---

##### **Step 2.5: Create Routing Logs**

For each carrier, create a RoutingLog entry:

**Success Case:**
```typescript
await RoutingLog.create({
  submissionId: submission._id,
  carrierId: carrier._id,
  status: "SENT",           // ✅ Email sent successfully
  emailSent: true,
  emailSentAt: new Date(),
  notes: "Routed via rule: Construction / Contractor / CA"
});
```

**Failure Case:**
```typescript
await RoutingLog.create({
  submissionId: submission._id,
  carrierId: carrier._id,
  status: "FAILED",         // ❌ Failed to route
  emailSent: false,
  errorMessage: "Carrier does not serve state TX",
  notes: "Failed to route: Carrier does not serve state TX"
});
```

**Database Result:**
```
RoutingLog Collection:
[
  {
    submissionId: "507f1f77bcf86cd799439011",
    carrierId: "Pacific Insurance Co ID",
    status: "SENT",
    emailSent: true,
    emailSentAt: "2024-01-15T10:30:00Z",
    notes: "Routed via rule: Construction / Contractor / CA"
  },
  {
    submissionId: "507f1f77bcf86cd799439011",
    carrierId: "Golden State Underwriters ID",
    status: "SENT",
    emailSent: true,
    emailSentAt: "2024-01-15T10:30:01Z",
    notes: "Routed via rule: Construction / Contractor / all states"
  }
]
```

---

##### **Step 2.6: Update Submission Status**

After routing to all carriers, check if at least one was successful:

```typescript
// Count successful routes
const successfulRoutes = await RoutingLog.countDocuments({
  submissionId: submission._id,
  status: "SENT",
});

if (successfulRoutes > 0) {
  // Update submission status to "ROUTED"
  await Submission.findByIdAndUpdate(submissionId, {
    status: "ROUTED"
  });
  console.log(`✅ Submission ${submissionId} status updated to ROUTED`);
} else {
  console.warn(`⚠️ No successful routes for submission ${submissionId}`);
  // Status remains "SUBMITTED"
}
```

**Status Flow:**
```
SUBMITTED → (RoutingEngine runs) → ROUTED ✅
```

---

## Complete Example Flow

### Scenario: Submit a Contractor Application in California

1. **User submits form:**
   - Industry: Construction
   - Subtype: Contractor
   - State: CA

2. **Submission created:**
   - Status: `"SUBMITTED"`
   - Saved to database

3. **RoutingEngine.routeSubmission() called automatically**

4. **Engine finds rules:**
   - ✅ Exact match: Pacific Insurance Co (CA-specific, priority 10)
   - ✅ Fallback: Golden State Underwriters (all states, priority 20)

5. **Engine checks carriers:**
   - ✅ Pacific Insurance Co serves CA
   - ✅ Golden State Underwriters serves CA

6. **Engine "sends" emails:**
   - 📧 Email to pacific@insurance.com
   - 📧 Email to golden@insurance.com
   - (Logged to console)

7. **Engine creates logs:**
   - RoutingLog #1: Pacific Insurance Co, status "SENT"
   - RoutingLog #2: Golden State Underwriters, status "SENT"

8. **Engine updates submission:**
   - Status changed: `"SUBMITTED"` → `"ROUTED"` ✅

---

## How to Test

### 1. **Seed Routing Rules:**
```bash
npm run seed:routing
```

This creates rules like:
- Construction/Contractor/CA → Pacific Insurance Co
- Construction/Contractor/all states → Golden State Underwriters

### 2. **Create a New Submission:**
- Go to `/agency/submit`
- Select: Construction → Contractor
- Fill form and submit

### 3. **Watch the Console:**
You'll see routing logs:
```
[RoutingEngine] Routing submission abc123: Construction / Contractor / CA
[RoutingEngine] 📧 Sending email to pacific@insurance.com...
[RoutingEngine] ✅ Successfully routed...
```

### 4. **Check Database:**
- Submission status should be `"ROUTED"`
- RoutingLog collection should have entries with status `"SENT"`

### 5. **Check Dashboard:**
- Go to `/agency/dashboard`
- Your submission should show status: **ROUTED** (with yellow badge)

---

## Key Points

✅ **Automatic:** Routing happens automatically when submission is created  
✅ **Priority-based:** Exact state matches come before state-agnostic rules  
✅ **State-aware:** Only routes to carriers that serve the submission's state  
✅ **Logged:** Every routing attempt is logged in RoutingLog  
✅ **Non-blocking:** If routing fails, submission still succeeds (error logged)  
✅ **Status update:** Submission status changes from "SUBMITTED" to "ROUTED"  

---

## Next Steps (Future Parts)

- **Part 6:** Admin enters quotes for routed submissions
- **Part 10:** Agency requests to bind after quote approval
- **Part 11:** Admin dashboard to view all routing logs






