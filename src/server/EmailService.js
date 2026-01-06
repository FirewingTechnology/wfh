const nodemailer = require('nodemailer');
const path = require('path');

// Email configuration
// In production, these should come from environment variables
const EMAIL_CONFIG = {
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
};

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Check if email credentials are properly configured
      if (!EMAIL_CONFIG.auth.user || EMAIL_CONFIG.auth.user === 'your-email@gmail.com') {
        console.warn('⚠️  Email service not configured. Set EMAIL_USER and EMAIL_PASS environment variables.');
        console.warn('📧 Using mock email service for development.');
        this.isConfigured = false;
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: EMAIL_CONFIG.host,
        port: EMAIL_CONFIG.port,
        secure: EMAIL_CONFIG.secure,
        auth: EMAIL_CONFIG.auth
      });

      this.isConfigured = true;
      console.log('✅ Email service initialized');
    } catch (error) {
      console.error('Error initializing email service:', error);
      this.isConfigured = false;
    }
  }

  // Send candidate creation email with login credentials
  async sendCandidateCreationEmail(candidateEmail, candidateName, username, password) {
    try {
      if (!this.isConfigured) {
        console.log('📧 [MOCK EMAIL] Candidate Creation Email would be sent to:', candidateEmail);
        console.log(`   Username: ${username}`);
        console.log(`   Password: ${password}`);
        return { success: true, mock: true };
      }

      const mailOptions = {
        from: `"Admin Portal" <${EMAIL_CONFIG.auth.user}>`,
        to: candidateEmail,
        subject: 'Your Login Credentials - Admin-Candidate Workflow',
        html: this.getCredentialsEmailTemplate(candidateName, username, password)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Candidate credentials email sent to:', candidateEmail);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending candidate creation email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send task assignment email with file attachment
  async sendTaskAssignmentEmail(candidateEmail, candidateName, taskName, taskDescription, filePath, deadline) {
    try {
      if (!this.isConfigured) {
        console.log('📧 [MOCK EMAIL] Task Assignment Email would be sent to:', candidateEmail);
        console.log(`   Task: ${taskName}`);
        console.log(`   Deadline: ${deadline}`);
        console.log(`   File: ${path.basename(filePath)}`);
        return { success: true, mock: true };
      }

      const mailOptions = {
        from: `"Admin Portal" <${EMAIL_CONFIG.auth.user}>`,
        to: candidateEmail,
        subject: `New Task Assignment: ${taskName}`,
        html: this.getTaskEmailTemplate(candidateName, taskName, taskDescription, deadline),
        attachments: [
          {
            filename: path.basename(filePath),
            path: filePath
          }
        ]
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Task assignment email sent to:', candidateEmail);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending task assignment email:', error);
      return { success: false, error: error.message };
    }
  }

  // Email template for candidate credentials
  getCredentialsEmailTemplate(name, username, password) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .credentials { background: white; padding: 15px; border-left: 4px solid #667eea; 
                          margin: 20px 0; font-family: 'Courier New', monospace; }
            .label { color: #666; font-weight: bold; }
            .value { color: #333; margin-bottom: 10px; }
            .btn { display: inline-block; background: #667eea; color: white; padding: 12px 20px; 
                   text-decoration: none; border-radius: 4px; margin-top: 20px; }
            .footer { color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Admin-Candidate Workflow</h1>
              <p>Your account has been created</p>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              <p>Your account has been successfully created in the Admin-Candidate Workflow system. 
                 Below are your login credentials to access your portal:</p>
              
              <div class="credentials">
                <div class="value">
                  <span class="label">Username:</span> ${username}
                </div>
                <div class="value">
                  <span class="label">Password:</span> ${password}
                </div>
              </div>

              <p><strong>⚠️ Important Security Notes:</strong></p>
              <ul>
                <li>Keep your credentials safe and do not share them with anyone</li>
                <li>Change your password after your first login</li>
                <li>If you did not create this account, please contact the administrator immediately</li>
              </ul>

              <p>You can now login to the platform using the above credentials.</p>

              <a href="${process.env.APP_URL || 'http://localhost:3000'}/candidate" class="btn">Login Now</a>

              <div class="footer">
                <p>If you have any questions or need assistance, please contact the administrator.</p>
                <p>This is an automated email. Please do not reply to this message.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Email template for task assignment
  getTaskEmailTemplate(name, taskName, taskDescription, deadline) {
    const deadlineDate = new Date(deadline).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%); 
                      color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .task-info { background: white; padding: 15px; border-left: 4px solid #20c997; margin: 20px 0; }
            .deadline { background: #fff3cd; padding: 12px; border-radius: 4px; margin: 20px 0; 
                       border-left: 4px solid #ffc107; }
            .label { color: #666; font-weight: bold; }
            .btn { display: inline-block; background: #20c997; color: white; padding: 12px 20px; 
                   text-decoration: none; border-radius: 4px; margin-top: 20px; }
            .footer { color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 New Task Assignment</h1>
              <p>You have been assigned a new task</p>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              <p>A new task has been assigned to you. Please find the details below:</p>
              
              <div class="task-info">
                <div style="margin-bottom: 15px;">
                  <span class="label">Task Name:</span><br>
                  ${taskName}
                </div>
                ${taskDescription ? `
                <div style="margin-bottom: 15px;">
                  <span class="label">Description:</span><br>
                  ${taskDescription}
                </div>
                ` : ''}
              </div>

              <div class="deadline">
                <strong>⏰ Deadline:</strong><br>
                ${deadlineDate}
              </div>

              <p><strong>📌 What to do:</strong></p>
              <ol>
                <li>Download the attached task file</li>
                <li>Complete the assigned work</li>
                <li>Submit your work before the deadline</li>
              </ol>

              <p>You can access your tasks anytime by logging into your candidate portal.</p>

              <a href="${process.env.APP_URL || 'http://localhost:3000'}/candidate" class="btn">View in Portal</a>

              <div class="footer">
                <p><strong>Need Help?</strong> Contact your administrator for any queries or clarifications.</p>
                <p>This is an automated email. Please do not reply to this message.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Send notification email (generic)
  async sendNotificationEmail(toEmail, subject, htmlContent) {
    try {
      if (!this.isConfigured) {
        console.log('📧 [MOCK EMAIL] Notification Email would be sent to:', toEmail);
        console.log(`   Subject: ${subject}`);
        return { success: true, mock: true };
      }

      const mailOptions = {
        from: `"Admin Portal" <${EMAIL_CONFIG.auth.user}>`,
        to: toEmail,
        subject: subject,
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Notification email sent to:', toEmail);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending notification email:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create and export singleton instance
const emailService = new EmailService();
module.exports = emailService;
