# Workflow Update Summary

## Overview
This document summarizes the changes made to implement the updated Submission → Carrier → Admin → Agency → Finance workflow.

## Key Changes

### 1. Quote Status Updates
**File:** `src/models/Quote.ts`

**Changes:**
- `ENTERED_BY_ADMIN` → `ENTERED`
- `ACCEPTED_BY_AGENCY` → `APPROVED`
- Field names updated:
  - `acceptedAt` → `approvedAt`
  - `acceptedByUserId` → `approvedByUserId`

**Status Flow:**
```
ENTERED (Admin enters quote from carrier)
  ↓
POSTED (Admin posts quote - visible to agency)
  ↓
APPROVED (Agency approves quote - enables finance options)
  ↓
BIND_REQUESTED
  ↓
BOUND
```

---

### 2. Single Carrier Routing

#### Agency Submission Form
**File:** `src/app/agency/submit/[templateId]/page.tsx`

**Changes:**
- Added carrier dropdown selector
- Added state for `selectedCarrierId` and `carriers` list
- Added carrier fetch from `/api/carriers`
- Added validation for carrier selection
- Included `carrierId` in form submission

#### Carriers API
**File:** `src/app/api/carriers/route.ts` (NEW)

**Purpose:** Fetch all carriers for dropdown selection
- Optional filtering by state and industry
- Returns carrier name, email, and fee structure

#### Submissions API
**File:** `src/app/api/submissions/route.ts`

**Changes:**
- Accept `carrierId` from form submission
- Replace multi-carrier routing with single-carrier routing
- Send mock email to selected carrier
- Create `RoutingLog` with `status: "SENT"`
- Update submission status to `"ROUTED"`

---

### 3. Admin Quote Entry

#### New API Endpoint
**File:** `src/app/api/admin/quotes/[submissionId]/enter/route.ts` (NEW)

**Endpoint:** `POST /api/admin/quotes/[submissionId]/enter`

**Purpose:** Admin manually enters a quote received from the carrier

**Request Body:**
```json
{
  "carrierId": "string",
  "carrierQuoteUSD": number,
  "basePremium": number (optional),
  "fees": number (optional),
  "taxes": number (optional),
  "effectiveDate": string (optional),
  "expirationDate": string (optional),
  "carrierReference": string (optional)
}
```

**Behavior:**
- Creates quote with status `"ENTERED"`
- Calculates wholesale fee based on carrier settings
- Updates submission status to `"QUOTED"`

#### Updated Admin Quote Entry Page
**File:** `src/app/admin/submissions/[id]/quote/page.tsx`

**Changes:**
- Updated to use new API endpoint `/api/admin/quotes/[submissionId]/enter`
- Removed redirect to post page (now goes to quotes list)

#### Legacy API Update
**File:** `src/app/api/admin/quotes/route.ts`

**Changes:**
- Updated status from `ENTERED_BY_ADMIN` to `ENTERED`

---

### 4. Admin Post Quote

**File:** `src/app/api/admin/quotes/[id]/post/route.ts`

**Changes:**
- Updated status check from `ENTERED_BY_ADMIN` to `ENTERED`
- Changes quote status to `POSTED`
- Sets `postedAt` timestamp

#### Admin Quotes Page
**File:** `src/app/admin/quotes/page.tsx`

**Changes:**
- Updated status badge colors to use new status names
- Added "Post Quote" button for `ENTERED` quotes
- Added `handlePostQuote` function
- Calls `/api/admin/quotes/[id]/post`

---

### 5. Agency Approve Quote

#### New API Endpoint
**File:** `src/app/api/agency/quotes/[id]/approve/route.ts` (NEW)

**Endpoint:** `POST /api/agency/quotes/[id]/approve`

**Purpose:** Agency approves a POSTED quote

**Rules:**
- Only agency users can approve
- Quote must be in `POSTED` status
- Verifies quote belongs to user's agency

**Behavior:**
- Changes status to `APPROVED`
- Sets `approvedAt` timestamp and `approvedByUserId`
- Enables finance plan options

#### Agency Quotes API
**File:** `src/app/api/agency/quotes/route.ts`

**Changes:**
- Updated status filters: `POSTED`, `APPROVED` (excludes `ENTERED`)
- Updated query parameter mapping: `ACCEPTED` → `APPROVED`

#### Agency Quotes Page
**File:** `src/app/agency/quotes/page.tsx`

**Changes:**
- Renamed `handleAcceptQuote` → `handleApproveQuote`
- Updated API call to `/api/agency/quotes/[id]/approve`
- Updated button text: "Accept Quote" → "Approve Quote"
- Updated status checks: `ACCEPTED_BY_AGENCY` → `APPROVED`
- Updated filter options and status badge colors
- Updated redirect: `?status=ACCEPTED` → `?status=APPROVED`

#### Agency Dashboard
**File:** `src/app/agency/dashboard/page.tsx`

**Changes:**
- Updated "Approved Quotes" link to `?status=APPROVED`
- Updated description text

---

### 6. Finance Flow

**Status:** No changes required

**Reason:** Finance options are enabled after quote approval. The component checks the quote status dynamically and works with the new `APPROVED` status without modification.

**Files:**
- `src/components/FinanceOption.tsx` - No hardcoded status checks
- `src/app/api/finance/*` - Work with any approved quote
- `src/models/FinancePlan.ts` - Status-agnostic
- `src/services/FinanceService.ts` - Status-agnostic

---

## Workflow Summary

### Complete Flow

1. **Agency Submits Application**
   - Agency selects ONE carrier from dropdown
   - Form submitted to `/api/submissions`
   - Mock email sent to carrier: `console.log`
   - `RoutingLog` created with `status: "SENT"`
   - Submission visible in `/admin/submissions`

2. **Carrier Reviews (External)**
   - Carrier receives email (mocked)
   - Carrier reviews risk and sends quote back (external process)
   - Carrier does NOT log into the system

3. **Admin Enters Quote**
   - Admin manually enters carrier's quote
   - `POST /api/admin/quotes/[submissionId]/enter`
   - Quote created with `status: "ENTERED"`
   - Quote visible in `/admin/quotes`

4. **Admin Posts Quote**
   - Admin reviews and posts the quote
   - `POST /api/admin/quotes/[quoteId]/post`
   - Status changes: `ENTERED` → `POSTED`
   - Quote becomes visible in agency's "Posted Quotes"
   - Agency receives mock notification

5. **Agency Approves Quote**
   - Agency reviews posted quote
   - `POST /api/agency/quotes/[id]/approve`
   - Status changes: `POSTED` → `APPROVED`
   - Finance options are now enabled

6. **Finance Plan (Optional)**
   - Agency can choose "Pay in Full" or "Finance Options"
   - Finance calculator available for `APPROVED` quotes
   - Down payment slider, tenure selector, interest input
   - Real-time EMI calculation and amortization schedule

---

## API Endpoints Summary

### New Endpoints
- `GET /api/carriers` - Fetch all carriers for dropdown
- `POST /api/admin/quotes/[submissionId]/enter` - Admin enters quote
- `POST /api/agency/quotes/[id]/approve` - Agency approves quote

### Updated Endpoints
- `POST /api/submissions` - Now accepts `carrierId` for single-carrier routing
- `POST /api/admin/quotes/[id]/post` - Status check updated
- `GET /api/agency/quotes` - Filter logic updated for new statuses

### Deprecated/Removed
- Old quote entry at `POST /api/admin/quotes` (still exists for compatibility but new workflow uses `/enter`)
- `POST /api/agency/quotes/[id]/accept` - Replaced by `/approve`

---

## Database Schema Impact

### Quote Model
```typescript
status: "ENTERED" | "POSTED" | "APPROVED" | "BIND_REQUESTED" | "BOUND"
approvedAt?: Date
approvedByUserId?: ObjectId
```

### No Migration Required
- Mongoose will handle the enum update automatically
- Existing quotes with old statuses will need manual update or will be considered legacy

---

## UI Changes Summary

### Admin Dashboard
- Quote list shows `ENTERED`, `POSTED`, `APPROVED` statuses
- "Post Quote" button for `ENTERED` quotes

### Agency Dashboard
- "Posted Quotes" - Shows `POSTED` quotes
- "Approved Quotes" - Shows `APPROVED` quotes

### Agency Submission Form
- New: Carrier dropdown selector
- Validation for carrier selection

### Agency Quotes Page
- "Approve Quote" button for `POSTED` quotes
- Finance options enabled for `APPROVED` quotes
- Updated filter dropdown options

---

## Testing Checklist

- [ ] Agency can select carrier when submitting application
- [ ] Mock email is logged to console for selected carrier
- [ ] Submission appears in Admin submissions list
- [ ] Admin can enter quote for submission
- [ ] Entered quote appears in Admin quotes list with `ENTERED` status
- [ ] Admin can post `ENTERED` quote
- [ ] Posted quote appears in Agency "Posted Quotes" with `POSTED` status
- [ ] Agency can approve `POSTED` quote
- [ ] Approved quote appears in Agency "Approved Quotes" with `APPROVED` status
- [ ] Finance options are enabled for `APPROVED` quotes
- [ ] Agency cannot approve `ENTERED` quotes
- [ ] Only `POSTED` and `APPROVED` quotes visible to agency

---

## Important Notes

### Status Visibility Rules
- **Agency sees:** `POSTED`, `APPROVED`, `BIND_REQUESTED`, `BOUND`
- **Agency does NOT see:** `ENTERED`

### Workflow Rules
- Only `system_admin` can enter and post quotes
- Only agency users can approve quotes
- Only `POSTED` quotes can be approved by agency
- Finance options appear only after quote is `APPROVED`
- Carrier never logs into the system

### Mock Email Format
```
📧 Mock Email to Carrier:
   To: carrier@example.com (Carrier Name)
   Subject: New Insurance Submission - Client Name
   Submission ID: 123abc...
   Client: John Doe - john@example.com
   Industry: Construction - Contractor
```

---

## Files Changed

### Models
- `src/models/Quote.ts`

### API Routes
- `src/app/api/carriers/route.ts` (NEW)
- `src/app/api/admin/quotes/[submissionId]/enter/route.ts` (NEW)
- `src/app/api/agency/quotes/[id]/approve/route.ts` (NEW)
- `src/app/api/submissions/route.ts`
- `src/app/api/admin/quotes/route.ts`
- `src/app/api/admin/quotes/[id]/post/route.ts`
- `src/app/api/agency/quotes/route.ts`

### UI Pages
- `src/app/agency/submit/[templateId]/page.tsx`
- `src/app/admin/quotes/page.tsx`
- `src/app/admin/submissions/[id]/quote/page.tsx`
- `src/app/agency/quotes/page.tsx`
- `src/app/agency/dashboard/page.tsx`

### No Changes Required
- `src/components/FinanceOption.tsx`
- `src/services/FinanceService.ts`
- `src/models/FinancePlan.ts`
- Finance API routes

---

## Next Steps (Future)

1. **Part 8:** Payment model + Payment APIs + Payment UI
2. **Part 9:** Document model + E-sign APIs + E-sign UI
3. **Part 10:** Bind request API + Policy upload
4. **Part 11:** Admin dashboard enhancements + CSV exports
5. **Part 12:** Tests, Docker, complete README



