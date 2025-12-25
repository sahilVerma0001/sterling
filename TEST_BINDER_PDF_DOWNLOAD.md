# Testing Guide: Binder PDF Download

## 🎯 What to Test

1. **Download Binder PDF Button** on quote detail page
2. **Direct Link to Binder PDF** (URL access)

---

## 📋 Prerequisites

Before testing, ensure you have:
- ✅ A quote that has been created by admin (status: "POSTED")
- ✅ The quote has a `binderPdfUrl` field populated
- ✅ You're logged in as an agency user

---

## 🧪 Testing Steps

### **Step 1: Create a Quote with Binder PDF**

1. **Submit an Application:**
   - Go to: `http://localhost:3001/agency/marketplace`
   - Select a program and fill out the form
   - Click "Submit Application"

2. **Admin Enters Quote:**
   - Log in as admin
   - Go to: `http://localhost:3001/admin/submissions`
   - Find your application
   - Click "Enter Quote"
   - Fill in quote details:
     - Carrier Quote: `5000`
     - Premium Tax %: `5`
     - Premium Tax Amount: `250`
     - Policy Fee: `100`
     - Other required fields
   - Click "Create Quote"
   - **This should generate the binder PDF automatically**

3. **Verify PDF Generation:**
   - Check terminal logs for:
     ```
     📄 Generating Binder PDF...
     ✅ Binder PDF generated: /path/to/binder-{quoteId}.pdf
     ```
   - The quote should now have `binderPdfUrl` populated

---

### **Step 2: Test Download Button on Quote Detail Page**

1. **Navigate to Quote Detail Page:**
   - Log in as agency user
   - Go to: `http://localhost:3001/agency/quotes`
   - Find the quote with status "POSTED"
   - Click on the quote to open detail page
   - OR directly go to: `http://localhost:3001/agency/quotes/{quoteId}`

2. **Locate the Download Button:**
   - Scroll to the "Quote Breakdown" section
   - At the bottom of the breakdown, you should see:
     ```
     ┌─────────────────────────────────────┐
     │  [📄 Download Binder PDF]          │
     └─────────────────────────────────────┘
     ```

3. **Test the Download:**
   - Click the "Download Binder PDF" button
   - The PDF should download to your browser's download folder
   - Open the PDF and verify:
     - ✅ Company information is correct
     - ✅ Premium breakdown is shown (Carrier + Tax + Policy Fee + Broker Fee)
     - ✅ **NO wholesale fee** appears
     - ✅ Policy limits are included
     - ✅ Endorsements are listed
     - ✅ Effective/Expiration dates are correct

---

### **Step 3: Test Direct Link to Binder PDF**

1. **Get the Binder PDF URL:**
   - On the quote detail page, right-click the "Download Binder PDF" button
   - Select "Copy link address" or "Inspect Element"
   - The URL should look like: `/documents/{timestamp}_binder-{quoteId}.pdf`
   - OR check browser console:
     - Open DevTools (F12)
     - Go to Console tab
     - Type: `quote.binderPdfUrl` (if quote object is available)
     - Copy the URL

2. **Access Directly:**
   - Open a new browser tab
   - Paste the full URL: `http://localhost:3001/documents/{filename}`
   - Example: `http://localhost:3001/documents/1234567890_binder-abc123.pdf`
   - The PDF should open directly in the browser
   - OR download automatically

3. **Verify File Location:**
   - The PDF is stored in: `public/documents/` folder
   - Since it's in the `public` folder, Next.js serves it directly
   - No API endpoint needed - it's a static file

---

### **Step 4: Verify PDF Content**

Open the downloaded PDF and check:

**✅ Required Sections:**
- [ ] Quote Number
- [ ] Binder Date
- [ ] Company Name
- [ ] DBA (if applicable)
- [ ] Contact Information (Phone, Email, Address)
- [ ] Agency Name
- [ ] Carrier Name
- [ ] Policy Information (Effective/Expiration dates)
- [ ] Premium Breakdown:
  - [ ] Carrier Quote
  - [ ] Premium Tax (if applicable)
  - [ ] Policy Fee (if applicable)
  - [ ] Broker Fee
  - [ ] Total Amount
  - [ ] **NO wholesale fee**
- [ ] Policy Limits
- [ ] Endorsements
- [ ] Special Notes (if any)

---

## 🐛 Troubleshooting

### **Issue 1: Download Button Not Showing**

**Problem:** The "Download Binder PDF" button doesn't appear

**Possible Causes:**
- Quote doesn't have `binderPdfUrl` field
- PDF wasn't generated when quote was created

**Solution:**
1. Check browser console for errors
2. Verify quote has `binderPdfUrl` in database
3. Re-generate binder PDF from admin panel

---

### **Issue 2: PDF Download Fails**

**Problem:** Clicking download button shows error or nothing happens

**Possible Causes:**
- PDF file doesn't exist at the path
- File permissions issue
- URL is incorrect

**Solution:**
1. Check terminal for errors
2. Verify PDF file exists in storage directory
3. Check file path in `binderPdfUrl` field
4. Verify API endpoint is working

---

### **Issue 3: PDF Opens But Is Empty/Corrupted**

**Problem:** PDF downloads but is blank or corrupted

**Possible Causes:**
- PDF generation failed partially
- File was not saved correctly

**Solution:**
1. Check terminal logs for PDF generation errors
2. Re-generate the binder PDF
3. Verify puppeteer is working correctly

---

### **Issue 4: Direct Link Returns 404**

**Problem:** Direct URL access returns "Not Found"

**Possible Causes:**
- PDF file path is incorrect
- File doesn't exist
- API route not set up correctly

**Solution:**
1. Check the actual file path in database
2. Verify file exists in storage directory
3. Check if API route exists for serving PDFs

---

## 🔍 Verification Checklist

After testing, verify:

- [ ] Download button appears on quote detail page
- [ ] Button is clickable and works
- [ ] PDF downloads successfully
- [ ] PDF opens correctly
- [ ] All content is present in PDF
- [ ] No wholesale fee in PDF
- [ ] Direct link works
- [ ] PDF can be shared via URL

---

## 📝 Expected Behavior

### **When Quote Has Binder PDF:**
- ✅ "Download Binder PDF" button is visible
- ✅ Button is styled with teal color (`bg-[#00BCD4]`)
- ✅ Clicking downloads the PDF
- ✅ PDF contains all required information

### **When Quote Doesn't Have Binder PDF:**
- ❌ "Download Binder PDF" button is NOT visible
- This is expected - only quotes with generated binders show the button

---

## 🚀 Quick Test Commands

### **Check Quote Has Binder PDF:**
```javascript
// In browser console on quote detail page
console.log(quote.binderPdfUrl);
// Should show: "/api/pdfs/binder-{id}.pdf" or similar
```

### **Test Direct Download:**
```bash
# Replace {filename} with actual filename from binderPdfUrl
# Example: /documents/1234567890_binder-abc123.pdf
curl http://localhost:3001/documents/{filename} --output test-binder.pdf

# Or in browser, just navigate to:
# http://localhost:3001/documents/{filename}
```

---

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________

Quote ID: ___________

✅ Download Button Visible: Yes/No
✅ Button Clickable: Yes/No
✅ PDF Downloads: Yes/No
✅ PDF Opens Correctly: Yes/No
✅ All Content Present: Yes/No
✅ No Wholesale Fee: Yes/No
✅ Direct Link Works: Yes/No

Issues Found:
- 

Notes:
- 
```

---

**Ready to test? Start with Step 1!** 🚀

