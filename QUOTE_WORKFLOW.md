# Quote Workflow & Status Transitions

## Status Flow Diagram

```
SUBMITTED (Agency)
  ↓ (auto-route)
ROUTED_TO_CARRIER
  ↓ (carrier external approval - implicit)
CARRIER_APPROVED (implicit)
  ↓ (admin action: POST /api/admin/quotes/[id]/post)
ENTERED_BY_ADMIN → POSTED
  ↓ (agency action: POST /api/agency/quotes/[id]/accept)
ACCEPTED_BY_AGENCY
  ↓ (agency action: bind request)
BIND_REQUESTED
  ↓ (admin upload policy)
BOUND / POLICY_ISSUED
```

## Quote Status Definitions

1. **ENTERED_BY_ADMIN**: Admin has entered a carrier quote into the system
   - Created when admin creates quote via `/api/admin/quotes`
   - Fields: `enteredByAdminId`, `enteredAt`

2. **POSTED**: Admin has posted the carrier-approved quote for agency review
   - Set via `POST /api/admin/quotes/[id]/post`
   - Fields: `postedAt`, `carrierReference` (optional)
   - Only `ENTERED_BY_ADMIN` quotes can be posted

3. **ACCEPTED_BY_AGENCY**: Agency has accepted the posted quote
   - Set via `POST /api/agency/quotes/[id]/accept`
   - Fields: `acceptedAt`, `acceptedByUserId`
   - Only `POSTED` quotes can be accepted
   - After acceptance, agency can proceed to finance/payment

4. **BIND_REQUESTED**: Agency has requested to bind the policy
   - Set when agency initiates bind request

5. **BOUND**: Policy has been bound and issued
   - Set when admin uploads final policy documents

## API Endpoints

### Admin Endpoints (System Admin Only)

1. **POST /api/admin/quotes**
   - Create a new quote (status: `ENTERED_BY_ADMIN`)
   - Requires: `submissionId`, `carrierId`, `carrierQuoteUSD`
   - Auto-calculates wholesale fee
   - Sets: `enteredByAdminId`, `enteredAt`

2. **POST /api/admin/quotes/[id]/post**
   - Post a carrier-approved quote (status: `ENTERED_BY_ADMIN` → `POSTED`)
   - Requires: System admin role
   - Optional: `carrierReference` (carrier quote number)
   - Sets: `postedAt`, `carrierReference`

3. **GET /api/admin/quotes**
   - Get all quotes (admin view)
   - Returns all quotes regardless of agency

### Agency Endpoints

1. **GET /api/agency/quotes**
   - Get quotes for authenticated agency
   - Query params: `status` (ALL, POSTED, ACCEPTED)
   - Returns quotes filtered by agency

2. **PATCH /api/agency/quotes/[id]**
   - Update broker fee for a quote
   - Recalculates `finalAmountUSD`
   - Only for quotes belonging to agency

3. **POST /api/agency/quotes/[id]/accept**
   - Accept a posted quote (status: `POSTED` → `ACCEPTED_BY_AGENCY`)
   - Requires: Quote belongs to agency, status is `POSTED`
   - Sets: `acceptedAt`, `acceptedByUserId`

## RBAC Rules

- **System Admin**:
  - Can create quotes (`ENTERED_BY_ADMIN`)
  - Can post quotes (`POSTED`)
  - Cannot accept quotes

- **Agency Users** (agency_admin, agency_user):
  - Can view their agency's quotes
  - Can update broker fee
  - Can accept posted quotes (`ACCEPTED_BY_AGENCY`)
  - Cannot create quotes
  - Cannot post quotes
  - Cannot change status to `ENTERED_BY_ADMIN` or `POSTED`

## UI Labels

### Agency Dashboard
- "Posted Quotes" (was "Approved Quotes")
- Description: "Carrier approved quotes ready for acceptance"

### Agency Quotes Page
- Filter options:
  - "All Quotes"
  - "Posted Quotes (Carrier Approved)"
  - "Accepted Quotes"
- Button for `POSTED` quotes: "Accept Quote / Proceed to Finance"
- Finance options shown for `ACCEPTED_BY_AGENCY` quotes

### Admin Pages
- "Enter Quote" - Create new quote
- "Post Quote" - Post carrier-approved quote
- Shows quote status badges with appropriate colors

## Database Schema

### Quote Model Fields

```typescript
{
  // Basic fields
  submissionId: ObjectId,
  carrierId: ObjectId,
  carrierQuoteUSD: number,
  wholesaleFeePercent: number,
  wholesaleFeeAmountUSD: number,
  brokerFeeAmountUSD: number,
  finalAmountUSD: number,
  
  // Status
  status: "ENTERED_BY_ADMIN" | "POSTED" | "ACCEPTED_BY_AGENCY" | "BIND_REQUESTED" | "BOUND",
  
  // Admin entry fields
  enteredByAdminId?: ObjectId,
  enteredAt?: Date,
  postedAt?: Date,
  carrierReference?: string,
  
  // Agency acceptance fields
  acceptedAt?: Date,
  acceptedByUserId?: ObjectId,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

## Status Transition Rules

1. **ENTERED_BY_ADMIN** → **POSTED**
   - Action: Admin posts quote
   - Endpoint: `POST /api/admin/quotes/[id]/post`
   - Required role: `system_admin`

2. **POSTED** → **ACCEPTED_BY_AGENCY**
   - Action: Agency accepts quote
   - Endpoint: `POST /api/agency/quotes/[id]/accept`
   - Required: Quote belongs to agency

3. **ACCEPTED_BY_AGENCY** → **BIND_REQUESTED**
   - Action: Agency requests bind (to be implemented in Part 10)

4. **BIND_REQUESTED** → **BOUND**
   - Action: Admin uploads policy (to be implemented in Part 10)






