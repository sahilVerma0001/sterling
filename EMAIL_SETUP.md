# 📧 Email Setup Guide

## Overview

The Sterling Portal now supports **real email routing** to carriers when agencies submit applications. You can enable this feature or keep using mock mode (console logging).

---

## 🚀 Quick Start (Mock Mode - Default)

**By default, emails are NOT sent** - they're logged to the console instead.

This is perfect for:
- ✅ Development and testing
- ✅ Demo purposes  
- ✅ When you don't have email credentials yet

**No configuration needed!** Just submit forms and check the terminal for mock emails.

---

## ⚙️ Enable Real Email Sending

To send **actual emails** to carriers and agencies, add these to your `.env.local` file:

```env
# Enable Email
EMAIL_ENABLED=true

# SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@sterlingportal.com
```

---

## 📮 Email Provider Setup

### **Option 1: Gmail (Recommended for Development)**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Add to `.env.local`:**
```env
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # App password (remove spaces)
EMAIL_FROM=noreply@yourdomain.com
```

---

### **Option 2: SendGrid (Recommended for Production)**

1. **Sign up** at https://sendgrid.com (Free tier: 100 emails/day)
2. **Create API Key:**
   - Go to Settings → API Keys
   - Create API Key with "Mail Send" permission
   - Copy the API key

3. **Add to `.env.local`:**
```env
EMAIL_ENABLED=true
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.your-sendgrid-api-key-here
EMAIL_FROM=noreply@yourdomain.com
```

---

### **Option 3: Outlook/Office 365**

```env
EMAIL_ENABLED=true
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
EMAIL_FROM=your-email@outlook.com
```

---

### **Option 4: Custom SMTP Server**

```env
EMAIL_ENABLED=true
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587  # or 465 for SSL
EMAIL_USER=your-username
EMAIL_PASS=your-password
EMAIL_FROM=noreply@yourdomain.com
```

---

## 📨 What Emails Are Sent?

### **1. Submission to Carrier**

**When:** Agency submits a new application and selects a carrier

**Sent To:** Selected carrier's email

**Content:**
- Submission ID
- Client name, email, phone
- Industry and subtype
- State information
- Next steps for the carrier

**Template:**
```
Subject: New Insurance Submission - [Client Name]

Dear [Carrier Name],

You have received a new insurance submission through Sterling Portal.

SUBMISSION DETAILS:
- Submission ID: 123abc...
- Industry: Construction - Contractor
- Client: John Doe
- Email: john@example.com
- Phone: (555) 123-4567

NEXT STEPS:
1. Review the submission
2. Assess the risk
3. Prepare your quote
4. Send your quote to the agency
```

---

### **2. Quote Posted to Agency**

**When:** Admin posts a quote (status: ENTERED → POSTED)

**Sent To:** Agency's email

**Content:**
- Quote ID
- Client name
- Link to view posted quotes

**Template:**
```
Subject: Quote Ready for Review - [Client Name]

Dear [Agency Name],

Good news! A quote is now available for your client [Client Name].

Quote ID: abc123...

Please log in to your dashboard to review and approve the quote.

[View Posted Quotes Button]
```

---

## 🧪 Testing Email Configuration

### **Test with Mock Mode (Default):**

1. Submit a form as agency
2. Check terminal - you'll see:
```
📧 ═══════════════════════════════════════════
📧 MOCK EMAIL - Submission to Carrier
📧 ═══════════════════════════════════════════
📧 From: noreply@sterlingportal.com
📧 To: carrier@example.com (ABC Insurance)
📧 Subject: New Insurance Submission - John Doe
📧 ═══════════════════════════════════════════
```

### **Test with Real Email Enabled:**

1. Configure `.env.local` with your SMTP settings
2. Restart dev server: `npm run dev`
3. Submit a form
4. Check terminal for:
```
✅ Email sent to carrier: carrier@example.com
📧 Message ID: <unique-id@...>
```

5. Check carrier's email inbox

---

## 🔍 Troubleshooting

### **Email Not Sending?**

Check terminal output:

**If you see:**
```
⚠️  Email not configured - using mock mode
```
**Fix:** Add all EMAIL_* variables to `.env.local` and set `EMAIL_ENABLED=true`

---

**If you see:**
```
❌ Failed to send email to carrier: [error]
```
**Common Issues:**

1. **Gmail "Less secure app" error:**
   - ✅ Use App Password (not regular password)
   - ✅ Enable 2FA first

2. **Connection timeout:**
   - ✅ Check EMAIL_HOST and EMAIL_PORT
   - ✅ Check firewall/network settings

3. **Authentication failed:**
   - ✅ Verify EMAIL_USER and EMAIL_PASS
   - ✅ Remove spaces from app password

4. **SendGrid error:**
   - ✅ Verify API key has "Mail Send" permission
   - ✅ Check SendGrid account is verified

---

### **Fallback Behavior**

If email sending fails, the system automatically:
- ✅ Falls back to mock mode (logs to console)
- ✅ Creates routing log with error message
- ✅ **Does NOT fail the submission** (non-fatal error)
- ✅ Admin can see the error in routing logs

This ensures submissions are never blocked by email issues!

---

## 📊 Email Logs & Monitoring

### **Check Routing Logs:**

```
Admin Dashboard → Submissions → [View Submission] → Routing Logs
```

Each log shows:
- ✅ Carrier name and email
- ✅ Email sent status (true/false)
- ✅ Timestamp
- ✅ Error message (if failed)

---

## 🔐 Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use App Passwords** - Not your main Gmail password
3. **Rotate credentials** - Change passwords regularly
4. **Use SendGrid for production** - Better deliverability
5. **Monitor email quotas** - Check your provider limits

---

## 🚀 Production Recommendations

For production deployments:

1. **Use SendGrid or similar service** (not Gmail)
2. **Verify your domain** with email provider
3. **Set up SPF/DKIM records** for better deliverability
4. **Use a custom FROM address** (noreply@yourdomain.com)
5. **Monitor email logs** in your provider dashboard
6. **Set up email templates** with your branding

---

## 📧 Email Templates Customization

Email templates are in: `src/services/EmailService.ts`

You can customize:
- ✅ HTML styling
- ✅ Email content
- ✅ Subject lines
- ✅ Footer information
- ✅ Company branding

Example customization:
```typescript
// In EmailService.ts
const subject = `🔔 New Submission - ${clientName}`;
// Change to:
const subject = `Your Company Name - New Submission - ${clientName}`;
```

---

## ✅ Summary

| Mode | Configuration | Use Case |
|------|--------------|----------|
| **Mock** (Default) | No config needed | Development, Testing |
| **Gmail** | App Password required | Quick setup, Testing |
| **SendGrid** | API Key required | Production, Reliable |
| **Custom SMTP** | Server credentials | Enterprise setups |

**Start with mock mode** → Test functionality → Enable real email when ready!

---

## 🆘 Need Help?

1. Check terminal logs for detailed error messages
2. Verify all EMAIL_* variables in `.env.local`
3. Test with Gmail first (easiest setup)
4. Check email provider documentation
5. Ensure dev server is restarted after changing .env

---

**Ready to test!** 🚀

Try submitting a form and watch the magic happen! ✨



