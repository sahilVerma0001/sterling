# Complete Insurance Portal Workflow Guide

## 🎯 Full Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    1. AGENCY SUBMISSION                      │
│  Agency → Select Carrier → Fill Form → Submit               │
│                 ↓ Mock Email to Carrier                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               2. ADMIN ENTERS QUOTE (Status: ENTERED)        │
│  Admin → View Submission → Enter Quote → Redirects to...    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│           3. ADMIN POSTS QUOTE (Status: POSTED)              │
│  Post Quote Page → Add Carrier Reference → Post Quote       │
│              ↓ Quote Now Visible to Agency                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│          4. AGENCY APPROVES QUOTE (Status: APPROVED)         │
│  Agency → Posted Quotes → Approve → Redirects to...         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                5. APPROVED QUOTES SECTION                    │
│  ✓ Pay in Full Option      ✓ Finance Options                │
│  └─ Full amount payment    └─ EMI Calculator                │
│                               └─ Amortization Schedule       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Step-by-Step Workflow

### **STEP 1: Agency Submits Application** 🏢

**URL:** `http://localhost:3000/agency/submit`

**Actions:**
1. Sign in as agency user (agency_admin or agency_user)
2. Select industry (e.g., Construction)
3. Select subtype (e.g., Contractor)
4. Click "Continue"

**Next Page:** Dynamic form with carrier selection

**Form Fields:**
- Client Contact Information (Name, Phone, Email, EIN)
- Business Address (Street, City, State, Zip)
- **NEW: Carrier Selection Dropdown** ⭐
- Industry-specific form fields
- CCPA Consent (if CA operations)
- File attachments

**What Happens After Submit:**
- ✅ Submission saved to database
- ✅ Mock email logged to console for selected carrier
- ✅ RoutingLog created with status `"SENT"`
- ✅ Submission status: `"ROUTED"`
- ✅ Submission visible in Admin panel
- ✅ Redirect to agency dashboard

**Console Output Example:**
```
📧 Mock Email to Carrier:
   To: carrier@example.com (ABC Insurance Co.)
   Subject: New Insurance Submission - John Doe Construction
   Submission ID: 507f1f77bcf86cd799439011
   Client: John Doe - john@example.com
   Industry: Construction - Contractor
✅ Submission routed to carrier: ABC Insurance Co.
```

---

### **STEP 2: Admin Enters Quote** 👨‍💼

**URL:** `http://localhost:3000/admin/submissions`

**Actions:**
1. Sign in as system_admin
2. Click on a submission with status `"ROUTED"`
3. Click "Enter Quote" button
4. Enter quote details:
   - Select carrier (pre-populated with routed carrier)
   - Enter carrier quote amount (USD)
   - View automatic calculation:
     - Wholesale fee (based on carrier settings)
     - Broker fee (optional, agency can add later)
     - Final amount
5. Click "Create Quote"

**API Called:**
```
POST /api/admin/quotes/[submissionId]/enter
Body: {
  carrierId: "...",
  carrierQuoteUSD: 5000.00
}
```

**What Happens:**
- ✅ Quote created with status `"ENTERED"`
- ✅ Submission status changes to `"QUOTED"`
- ✅ Success message displayed
- ✅ **Auto-redirect to Post Quote page** 🎯

**Quote Data Created:**
```json
{
  "status": "ENTERED",
  "carrierQuoteUSD": 5000.00,
  "wholesaleFeePercent": 15,
  "wholesaleFeeAmountUSD": 750.00,
  "brokerFeeAmountUSD": 0,
  "finalAmountUSD": 5750.00,
  "enteredByAdminId": "...",
  "enteredAt": "2025-01-15T10:30:00Z"
}
```

---

### **STEP 3: Admin Posts Quote** 📤

**URL:** `http://localhost:3000/admin/quotes/[quoteId]/post`
*(Automatically redirected here after creating quote)*

**Page Shows:**
- ✅ Quote details summary
- ✅ Client name and carrier
- ✅ Amount breakdown
- ✅ Carrier Reference input field (optional)

**Actions:**
1. Review quote details
2. **(Optional)** Enter carrier reference/quote ID
   - Examples: `"CARR-2024-001"`, `"Q123456"`, `"ABC-INS-789"`
3. Click "Post Quote to Agency"

**API Called:**
```
POST /api/admin/quotes/[quoteId]/post
Body: {
  carrierReference: "CARR-2024-001"  // optional
}
```

**What Happens:**
- ✅ Quote status changes: `"ENTERED"` → `"POSTED"`
- ✅ `postedAt` timestamp set
- ✅ Carrier reference saved (if provided)
- ✅ Quote becomes **visible in Agency dashboard**
- ✅ Mock notification to agency (console.log)
- ✅ Success message displayed
- ✅ Redirect back to admin quotes list

**Console Output:**
```
✅ Quote posted successfully
📧 Mock notification to agency: Quote available for approval
```

---

### **STEP 4: Agency Views Posted Quotes** 📬

**URL:** `http://localhost:3000/agency/quotes?status=POSTED`

**From Agency Dashboard:**
- Click "Posted Quotes" card

**What Agency Sees:**
- ✅ All quotes with status `"POSTED"`
- ✅ Client information
- ✅ Carrier name
- ✅ Quote amounts (carrier quote, fees, final amount)
- ✅ Status badge: **POSTED** (purple)
- ✅ "Approve Quote" button

**Quotes NOT Visible:**
- ❌ Quotes with status `"ENTERED"` (admin hasn't posted yet)

---

### **STEP 5: Agency Approves Quote** ✅

**Actions:**
1. Click "Approve Quote" button on a POSTED quote

**API Called:**
```
POST /api/agency/quotes/[quoteId]/approve
```

**Validation:**
- ✅ Only agency users can approve
- ✅ Quote must be in `"POSTED"` status
- ✅ Quote must belong to the agency

**What Happens:**
- ✅ Quote status changes: `"POSTED"` → `"APPROVED"`
- ✅ `approvedAt` timestamp set
- ✅ `approvedByUserId` recorded
- ✅ Success message displayed
- ✅ **Auto-redirect to Approved Quotes** 🎯

**Console Output:**
```
✅ Quote [quoteId] approved by agency user [userId]
📧 Mock notification: Agency approved quote for John Doe Construction
```

---

### **STEP 6: Approved Quotes - Payment Options** 💰

**URL:** `http://localhost:3000/agency/quotes?status=APPROVED`

**From Agency Dashboard:**
- Click "Approved Quotes" card

**What Agency Sees:**
Two payment option cards side-by-side:

#### **Option A: Pay in Full** 💵

```
┌────────────────────────────┐
│ Pay in Full                │
│ $5,750.00                  │
│ One-time payment           │
└────────────────────────────┘
```

**Features:**
- Shows final total amount
- One-click payment (Part 8: Payment integration)

#### **Option B: Finance Options** 📊

```
┌────────────────────────────┐
│ Finance Options            │
│ View financing plans       │
└────────────────────────────┘
```

**Click to Expand Finance Details:**

**Finance Calculator:**
- **Down Payment Slider:** 0% to 100%
- **Tenure Dropdown:** 6, 12, 18, 24, 36, 48, 60 months
- **Annual Interest Input:** Custom rate (e.g., 8.5%)

**Real-time Calculation Shows:**
- Down payment amount
- Principal amount (financed amount)
- Monthly EMI (installment)
- Total payable amount
- Total interest

**Example Calculation:**
```
Total Amount: $5,750.00
Down Payment (20%): $1,150.00
Principal: $4,600.00
Tenure: 12 months
Interest: 8.5% p.a.

Monthly EMI: $397.45
Total Payable: $5,919.40
Total Interest: $169.40
```

**Amortization Schedule (First 12 Months):**
```
┌───────┬────────────┬──────────┬──────────┬──────────┐
│ Month │ EMI        │ Principal│ Interest │ Balance  │
├───────┼────────────┼──────────┼──────────┼──────────┤
│   1   │ $397.45    │ $364.78  │ $32.67   │ $4,235.22│
│   2   │ $397.45    │ $367.35  │ $30.10   │ $3,867.87│
│  ...  │    ...     │   ...    │   ...    │   ...    │
│  12   │ $397.45    │ $394.64  │  $2.81   │   $0.00  │
└───────┴────────────┴──────────┴──────────┴──────────┘
```

**Actions:**
- Adjust sliders/inputs → Auto-recalculates
- Click "Calculate EMI" → Refresh calculation
- Click "Save Finance Plan" → Store plan to quote

---

## 🔐 Role-Based Access Control (RBAC)

### **System Admin**
✅ Can access:
- `/admin/submissions` - View all submissions
- `/admin/quotes` - View all quotes
- `/admin/quotes/[id]/enter` - Enter new quotes
- `/admin/quotes/[id]/post` - Post quotes to agencies

❌ Cannot access:
- Agency-specific routes

### **Agency Admin / Agency User**
✅ Can access:
- `/agency/submit` - Create new submissions
- `/agency/submissions` - View own submissions
- `/agency/quotes?status=POSTED` - View posted quotes
- `/agency/quotes?status=APPROVED` - View approved quotes
- `/agency/quotes/[id]/approve` - Approve posted quotes

❌ Cannot access:
- Admin routes
- Quotes with status `"ENTERED"` (not posted yet)
- Other agencies' data

---

## 📊 Quote Status Lifecycle

```
ENTERED
  ↓ (Admin posts quote)
POSTED
  ↓ (Agency approves quote)
APPROVED
  ↓ (Agency selects payment/finance - Part 8)
BIND_REQUESTED
  ↓ (Admin binds policy - Part 10)
BOUND
```

### **Status Details:**

| Status | Visible To | Actions Available | Next Step |
|--------|-----------|-------------------|-----------|
| `ENTERED` | Admin only | Post quote | Admin posts |
| `POSTED` | Admin + Agency | Approve quote | Agency approves |
| `APPROVED` | Admin + Agency | Pay/Finance | Agency pays (Part 8) |
| `BIND_REQUESTED` | Admin + Agency | Bind policy | Admin binds (Part 10) |
| `BOUND` | Admin + Agency | View policy | Complete |

---

## 🎨 UI/UX Flow Summary

### **Admin Journey:**
```
1. Login → Admin Dashboard
2. Click "Submissions"
3. Click submission → View details
4. Click "Enter Quote"
5. Fill quote form → Submit
   ↓ Auto-redirect
6. Post Quote page → Add reference → Post
   ↓ Auto-redirect
7. Back to Quotes list → See quote as POSTED
```

### **Agency Journey:**
```
1. Login → Agency Dashboard
2. Click "New Submission"
3. Select industry/subtype
4. Fill form + Select Carrier → Submit
   ↓ Return to dashboard
5. Wait for admin to post quote
6. Click "Posted Quotes"
7. See quote → Click "Approve Quote"
   ↓ Auto-redirect to Approved Quotes
8. View payment options:
   - Pay in Full
   - Finance Options (EMI calculator)
```

---

## 🧪 Testing Checklist

### **End-to-End Test:**

- [ ] **Agency Submission**
  - [ ] Can select carrier from dropdown
  - [ ] Form validates all required fields
  - [ ] File upload works
  - [ ] Mock email appears in console
  - [ ] Submission appears in admin panel

- [ ] **Admin Quote Entry**
  - [ ] Can access submission details
  - [ ] Carrier selection works
  - [ ] Amount calculations correct
  - [ ] Quote created with status `ENTERED`
  - [ ] Redirects to post quote page

- [ ] **Admin Post Quote**
  - [ ] Post page shows correct quote details
  - [ ] Can add carrier reference
  - [ ] Post button works
  - [ ] Status changes to `POSTED`
  - [ ] Redirects to quotes list

- [ ] **Agency Posted Quotes**
  - [ ] Posted quote appears in agency dashboard
  - [ ] `ENTERED` quotes NOT visible
  - [ ] Approve button present
  - [ ] Quote details accurate

- [ ] **Agency Approve Quote**
  - [ ] Approve button works
  - [ ] Status changes to `APPROVED`
  - [ ] Redirects to approved quotes section

- [ ] **Finance Options**
  - [ ] Both payment options visible
  - [ ] Finance calculator works
  - [ ] EMI calculations accurate
  - [ ] Amortization schedule displays correctly
  - [ ] Can adjust all parameters

---

## 🚀 Quick Start Commands

```bash
# 1. Start development server
npm run dev

# 2. Open browser
http://localhost:3000

# 3. Sign in as Admin
Email: admin@sterlingportal.com
Password: [your admin password]

# 4. Sign in as Agency
Email: agency@example.com
Password: [your agency password]
```

---

## 📝 API Endpoints Reference

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/submissions` | Create submission | agency_* |
| GET | `/api/admin/submissions` | List all submissions | system_admin |
| GET | `/api/admin/submissions/[id]` | Get submission details | system_admin |
| POST | `/api/admin/quotes/[id]/enter` | Enter quote (id=submissionId) | system_admin |
| GET | `/api/admin/quotes/[id]` | Get quote details (id=quoteId) | system_admin |
| POST | `/api/admin/quotes/[id]/post` | Post quote (id=quoteId) | system_admin |
| GET | `/api/admin/quotes` | List all quotes | system_admin |
| GET | `/api/agency/quotes` | List agency quotes | agency_* |
| POST | `/api/agency/quotes/[id]/approve` | Approve quote | agency_* |
| POST | `/api/finance/calculate` | Calculate EMI | agency_* |
| GET | `/api/finance/[quoteId]` | Get finance plan | agency_* |
| POST | `/api/finance/[quoteId]` | Save finance plan | agency_* |

---

## 🎯 Next Steps (Future Parts)

- **Part 8:** Payment Integration (Stripe/PayPal)
- **Part 9:** Document Management & E-Signatures
- **Part 10:** Bind Requests & Policy Management
- **Part 11:** Advanced Admin Dashboard & Analytics
- **Part 12:** Testing Suite & Docker Deployment

---

## 💡 Tips & Best Practices

1. **Always check the terminal console** for mock email logs
2. **Use carrier references** to track quotes from carriers
3. **Test with different roles** to verify RBAC
4. **Clear browser cache** if you see stale data
5. **Restart dev server** after major model changes

---

## 🐛 Troubleshooting

### **Quote not visible in agency dashboard?**
- Check quote status (must be `POSTED`, not `ENTERED`)
- Verify admin posted the quote
- Refresh the page

### **Cannot approve quote?**
- Ensure quote is `POSTED` status
- Verify you're logged in as agency user
- Check quote belongs to your agency

### **Finance calculator not showing?**
- Ensure quote is `APPROVED` status
- Check browser console for errors
- Verify finance APIs are working

### **Redirect not working after approve?**
- Check browser console for errors
- Verify API response is successful
- Clear browser cache and retry

---

**All systems ready!** 🚀

Start testing from Step 1 and follow the complete workflow.



