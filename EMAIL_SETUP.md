# Email Configuration Guide

## Overview
The Admin-Candidate Workflow application automatically sends emails in the following scenarios:

1. **Candidate Creation Email** - Sent to candidate's email with login credentials
2. **Task Assignment Email** - Sent to candidate's email with task file attachment

## Setting Up Email Service

### Quick Start (Gmail with App Password)

1. **Enable 2-Factor Authentication on your Google Account**
   - Visit: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the generated 16-character password

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Update your .env file**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   APP_URL=http://localhost:3000
   ```

5. **Restart the server**
   ```bash
   npm run server
   ```

### Using Other Email Providers

#### Outlook / Hotmail
```env
EMAIL_SERVICE=outlook
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### SendGrid
```env
EMAIL_SERVICE=sendgrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=SG.your-sendgrid-api-key
```

#### Custom SMTP Server
```env
EMAIL_SERVICE=custom
EMAIL_HOST=mail.yourcompany.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-username
EMAIL_PASS=your-password
```

## Development Mode

If email credentials are not configured, the application runs in **mock mode**:
- Emails are NOT sent
- Email actions are logged to console
- Useful for local testing without actual email service

Example console output:
```
📧 [MOCK EMAIL] Candidate Creation Email would be sent to: candidate@example.com
   Username: Swift_Tiger_123
   Password: SecurePass_456
```

## Troubleshooting

### Email Not Sending

1. **Check if EMAIL_USER and EMAIL_PASS are set**
   ```bash
   echo $EMAIL_USER
   echo $EMAIL_PASS
   ```

2. **Gmail App Password Issues**
   - Verify 2-Factor Authentication is enabled
   - Re-generate app password
   - Make sure you copied the full 16-character password (no spaces)

3. **Check Server Logs**
   Look for error messages like:
   - `Error initializing email service`
   - `Error sending candidate creation email`

4. **SMTP Connection Failed**
   - Verify EMAIL_HOST and EMAIL_PORT
   - Check if firewall allows outgoing SMTP connections
   - Some networks block port 587/465

### Email Received in Spam

1. Add SPF record to your domain
2. Add DKIM signature
3. Add DMARC policy

### Rate Limiting

Some email providers limit sending:
- Gmail: ~500 emails/day
- SendGrid Free: 100 emails/day
- Outlook: 300 emails/hour

## Email Templates

### Candidate Creation Email
- **Recipient**: Candidate's email address
- **Subject**: "Your Login Credentials - Admin-Candidate Workflow"
- **Contains**:
  - Welcome message
  - Username and temporary password
  - Security notes
  - Login link
  - Support contact information

### Task Assignment Email
- **Recipient**: Assigned candidate's email
- **Subject**: "New Task Assignment: [Task Name]"
- **Contains**:
  - Task name and description
  - Deadline information
  - Attached task ZIP file
  - Instructions
  - Portal link
  - Support information

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `EMAIL_SERVICE` | `gmail` | Email service provider |
| `EMAIL_HOST` | `smtp.gmail.com` | SMTP server hostname |
| `EMAIL_PORT` | `587` | SMTP port number |
| `EMAIL_SECURE` | `false` | Use TLS (false for 587, true for 465) |
| `EMAIL_USER` | `your-email@gmail.com` | Sender email address |
| `EMAIL_PASS` | `your-app-password` | Email password or app password |
| `APP_URL` | `http://localhost:3000` | Application URL for email links |

## Security Best Practices

1. **Never commit .env file to version control**
   - Add `.env` to `.gitignore`

2. **Use App Passwords instead of regular passwords**
   - More secure for applications
   - Can be revoked individually

3. **Rotate credentials regularly**
   - Generate new app passwords quarterly

4. **Use Environment Variables in Production**
   - Store sensitive data in environment variables
   - Never hardcode credentials

5. **Enable Less Secure App Access (if using Gmail)**
   - For older authentication methods
   - Not recommended - use App Passwords instead

## Testing Email Setup

You can test the email configuration by:

1. Creating a test candidate
   - Check email inbox for credentials

2. Creating a test task assignment
   - Check email inbox for task file

3. Check server console logs
   - Look for success/error messages

## Support

For email configuration issues:
1. Check the console logs for error messages
2. Verify EMAIL_USER and EMAIL_PASS are correct
3. Test SMTP connection separately
4. Check email provider's documentation
5. Review firewall and network settings

## Additional Resources

- **Gmail**: https://support.google.com/mail/answer/7126229
- **Outlook**: https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-8361e398-8af4-4e97-b3ba-1ddffb6f896b
- **SendGrid**: https://sendgrid.com/docs/
- **Nodemailer**: https://nodemailer.com/
