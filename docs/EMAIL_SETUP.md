# Email Configuration Guide

This guide explains how to set up email notifications for Param Adventures using free email services.

## 📧 Overview

Email notifications are used for:

- **User Authentication**: Password reset, email verification
- **Booking Confirmations**: Trip booking confirmations and updates
- **Admin Notifications**: New bookings, trip inquiries
- **Marketing**: Newsletter subscriptions (future feature)

## 🎯 Recommended Services

### Option 1: Resend (Recommended)

**Best for**: Production with custom domain
**Free Tier**: 100 emails/day, 3,000/month
**Pros**: Modern API, excellent deliverability, easy setup

#### Setup Steps:

1. **Create Account**
   - Go to [resend.com](https://resend.com)
   - Sign up with your email

2. **Verify Domain** (Required for production)
   - Go to Domains → Add Domain
   - Add your domain (e.g., `paramadventures.com`)
   - Add the provided DNS records to your domain:
     ```
     SPF: TXT @ "v=spf1 include:_spf.resend.com ~all"
     DKIM: TXT resend._domainkey [provided value]
     ```
   - Wait for verification (usually < 5 minutes)

3. **Get API Key**
   - Go to API Keys → Create API Key
   - Name it "Param Adventures Production"
   - Copy the key (starts with `re_`)

4. **Configure Environment Variables**

   ```env
   SMTP_HOST="smtp.resend.com"
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER="resend"
   SMTP_PASS="re_your_api_key_here"
   SMTP_FROM="noreply@yourdomain.com"
   ```

5. **Test Email**
   ```bash
   cd apps/api
   node scripts/test-email.js
   ```

---

### Option 2: Brevo (formerly Sendinblue)

**Best for**: Higher volume, marketing features
**Free Tier**: 300 emails/day (9,000/month)
**Pros**: Higher limits, includes SMS, built-in templates

#### Setup Steps:

1. **Create Account**
   - Go to [brevo.com](https://www.brevo.com)
   - Sign up (requires phone verification)

2. **Get SMTP Credentials**
   - Go to Settings → SMTP & API
   - Under "SMTP", click "Generate SMTP Key"
   - Note down your login email and the generated key

3. **Configure Environment Variables**

   ```env
   SMTP_HOST="smtp-relay.brevo.com"
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER="your-brevo-login-email@example.com"
   SMTP_PASS="your-brevo-smtp-key"
   SMTP_FROM="noreply@yourdomain.com"
   ```

4. **Verify Sender**
   - Go to Senders & Domains → Senders
   - Add your "from" email
   - Verify via email confirmation

5. **Test Email**
   ```bash
   cd apps/api
   node scripts/test-email.js
   ```

---

### Option 3: Gmail (Development Only)

**Best for**: Local development, testing
**Free Tier**: 500 emails/day
**Cons**: Requires app password, not recommended for production

#### Setup Steps:

1. **Enable 2-Step Verification**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to Security → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Param Adventures Dev"
   - Copy the 16-character password

3. **Configure Environment Variables**
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-16-char-app-password"
   SMTP_FROM="your-email@gmail.com"
   ```

---

## 🧪 Testing Email Setup

Create a test script at `apps/api/scripts/test-email.js`:

```javascript
const nodemailer = require("nodemailer");
require("dotenv").config();

async function testEmail() {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: "your-test-email@example.com",
      subject: "Test Email from Param Adventures",
      text: "If you receive this, email is configured correctly!",
      html: "<p>If you receive this, email is <strong>configured correctly</strong>!</p>",
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Email failed:", error.message);
  }
}

testEmail();
```

Run the test:

```bash
cd apps/api
node scripts/test-email.js
```

---

## 📋 Email Templates

The application uses the following email templates (managed in code):

### 1. Welcome Email

**Trigger**: User registration
**Template**: `apps/api/src/templates/welcome.html`

### 2. Password Reset

**Trigger**: User requests password reset
**Template**: `apps/api/src/templates/password-reset.html`
**Contains**: Reset link with token (expires in 1 hour)

### 3. Booking Confirmation

**Trigger**: Successful payment
**Template**: `apps/api/src/templates/booking-confirmation.html`
**Contains**: Trip details, booking ID, guest info

### 4. Booking Status Update

**Trigger**: Admin approves/rejects booking
**Template**: `apps/api/src/templates/booking-update.html`

### 5. Trip Inquiry Notification

**Trigger**: User submits custom trip inquiry
**Template**: Sent to admin email
**Recipient**: Admin/trip manager

---

## 🔒 Security Best Practices

1. **Never commit real credentials** to Git
2. **Use app passwords** for Gmail (not your actual password)
3. **Verify sender domains** in production
4. **Rate limit** password reset emails (prevent abuse)
5. **Monitor bounce rates** in your email provider dashboard
6. **Use HTTPS** for all reset/verification links

---

## 🚨 Troubleshooting

### Email not sending

**Check 1**: Verify environment variables are loaded

```bash
cd apps/api
node -e "console.log(process.env.SMTP_HOST, process.env.SMTP_PASS)"
```

**Check 2**: Test SMTP connection

```bash
npm install -g smtp-tester
smtp-tester smtp.resend.com 465
```

**Check 3**: Check firewall/network

- Ensure outbound port 587 (or 465) is open
- Some corporate networks block SMTP

**Check 4**: Review logs

```bash
# Check API logs for email errors
cd apps/api
npm run start | grep "email\|SMTP"
```

### Emails going to spam

1. **Verify sender domain** (SPF, DKIM records)
2. **Use professional "from" address** (not gmail.com in production)
3. **Include unsubscribe link** in marketing emails
4. **Avoid spam trigger words** in subject lines

### Ethereal Test Account (Fallback)

If no SMTP is configured, the app automatically uses [Ethereal Email](https://ethereal.email) for testing:

- Emails are NOT actually delivered
- Preview URLs are logged to console
- Perfect for local development

Example log:

```
⚠️ No SMTP config found. Generating Ethereal testing account...
✉️ Notification sent: <message-id>
🔗 Preview URL: https://ethereal.email/message/xxxxx
```

---

## 📊 Monitoring

### Resend Dashboard

- View sent emails, open rates, click rates
- Check delivery status (sent, delivered, bounced)
- API usage metrics

### Brevo Dashboard

- Real-time statistics (opens, clicks)
- Contact management
- Campaign analytics

### Log Emails Sent

The app automatically logs all sent emails to:

- Console (development)
- Sentry (production errors)
- Database audit logs (sensitive actions)

---

## 🎯 Production Checklist

Before deploying to production:

- [ ] Domain verified with email provider
- [ ] SPF and DKIM records added to DNS
- [ ] SMTP credentials added to Render/hosting environment variables
- [ ] Test email sent from production environment
- [ ] Monitor first 24 hours for bounce rate
- [ ] Set up email alert rules (failed deliveries)
- [ ] Document sender email in user-facing docs
- [ ] Configure reply-to address if needed

---

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Brevo SMTP Guide](https://help.brevo.com/hc/en-us/articles/209465765)
- [Nodemailer Documentation](https://nodemailer.com)
- [Email Deliverability Best Practices](https://www.validity.com/blog/email-deliverability-best-practices/)

---

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review API logs: `apps/api/logs/`
3. Test with Ethereal (no SMTP config) to isolate the issue
4. Contact your email provider's support (Resend/Brevo have excellent support)
