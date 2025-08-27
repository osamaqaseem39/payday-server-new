const nodemailer = require('nodemailer');

/**
 * Email Service Class
 * Single Responsibility: Handle all email operations for the application
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize the email transporter
   */
  async initializeTransporter() {
    try {
      // Create transporter based on environment
      if (process.env.NODE_ENV === 'production') {
        // Production: Use real SMTP settings
        this.transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
          }
        });
      } else {
        // Development: Use test account or ethereal
        this.transporter = nodemailer.createTransporter({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: 'test@ethereal.email',
            pass: 'test123'
          }
        });
      }

      // Verify connection
      await this.transporter.verify();
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
      // Don't throw error - email service is optional
    }
  }

  /**
   * Send career application confirmation email to applicant
   */
  async sendApplicationConfirmation(application) {
    try {
      if (!this.transporter) {
        console.log('⚠️ Email service not available, skipping confirmation email');
        return false;
      }

      const mailOptions = {
        from: process.env.SMTP_USER || 'noreply@paydayexpress.ca',
        to: application.email,
        subject: `Application Received - ${application.position}`,
        html: this.generateApplicationConfirmationTemplate(application)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Application confirmation email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send application confirmation email:', error.message);
      return false;
    }
  }

  /**
   * Send notification email to HR team about new application
   */
  async sendHRNotification(application) {
    try {
      if (!this.transporter) {
        console.log('⚠️ Email service not available, skipping HR notification');
        return false;
      }

      const hrEmail = process.env.HR_EMAIL || 'hr@paydayexpress.ca';
      
      const mailOptions = {
        from: process.env.SMTP_USER || 'noreply@paydayexpress.ca',
        to: hrEmail,
        subject: `New Career Application - ${application.position}`,
        html: this.generateHRNotificationTemplate(application)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ HR notification email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send HR notification email:', error.message);
      return false;
    }
  }

  /**
   * Generate HTML template for application confirmation email
   */
  generateApplicationConfirmationTemplate(application) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Received - Payday Express</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .highlight { background: #e0e7ff; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Application Received!</h1>
            <p>Thank you for applying to Payday Express</p>
          </div>
          
          <div class="content">
            <h2>Hello ${application.firstName},</h2>
            
            <p>We're excited to confirm that we've received your application for the <strong>${application.position}</strong> position at Payday Express.</p>
            
            <div class="highlight">
              <h3>Application Details:</h3>
              <ul>
                <li><strong>Position:</strong> ${application.position}</li>
                <li><strong>Experience Level:</strong> ${application.experience}</li>
                <li><strong>Applied:</strong> ${new Date(application.appliedAt).toLocaleDateString()}</li>
                <li><strong>Application ID:</strong> ${application._id}</li>
              </ul>
            </div>
            
            <p>Our HR team will review your application and get back to you within 5-7 business days. We'll contact you via email or phone to discuss next steps.</p>
            
            <p>In the meantime, feel free to:</p>
            <ul>
              <li>Visit our <a href="https://paydayexpress.ca/career">careers page</a> to learn more about working with us</li>
              <li>Follow us on social media for company updates</li>
              <li>Check out our <a href="https://paydayexpress.ca">main website</a> to learn more about our services</li>
            </ul>
            
            <p>If you have any questions about your application, please don't hesitate to reach out to our HR team at <a href="mailto:hr@paydayexpress.ca">hr@paydayexpress.ca</a>.</p>
            
            <p>Thank you for your interest in joining the Payday Express team!</p>
            
            <p>Best regards,<br>
            <strong>The Payday Express HR Team</strong></p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Payday Express. All rights reserved.</p>
            <p>This email was sent to ${application.email}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML template for HR notification email
   */
  generateHRNotificationTemplate(application) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Career Application - Payday Express</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .highlight { background: #d1fae5; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .urgent { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 New Career Application</h1>
            <p>A new candidate has applied to join our team</p>
          </div>
          
          <div class="content">
            <h2>New Application Received</h2>
            
            <div class="highlight">
              <h3>Candidate Information:</h3>
              <ul>
                <li><strong>Name:</strong> ${application.firstName} ${application.lastName}</li>
                <li><strong>Email:</strong> <a href="mailto:${application.email}">${application.email}</a></li>
                <li><strong>Phone:</strong> ${application.phone}</li>
                <li><strong>Position:</strong> ${application.position}</li>
                <li><strong>Experience Level:</strong> ${application.experience}</li>
                <li><strong>Applied:</strong> ${new Date(application.appliedAt).toLocaleDateString()}</li>
                <li><strong>Application ID:</strong> ${application._id}</li>
              </ul>
            </div>
            
            ${application.coverLetter ? `
            <div class="urgent">
              <h3>Cover Letter:</h3>
              <p>${application.coverLetter.substring(0, 200)}${application.coverLetter.length > 200 ? '...' : ''}</p>
            </div>
            ` : ''}
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Review the application and cover letter</li>
              <li>Check the candidate's experience level</li>
              <li>Schedule initial screening if qualified</li>
              <li>Update application status in the system</li>
            </ol>
            
            <a href="${process.env.DASHBOARD_URL || 'https://payday-new.vercel.app'}/applications/${application._id}" class="button">View Full Application</a>
            
            <p>Please review this application within 48 hours and update the status accordingly.</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Payday Express. All rights reserved.</p>
            <p>This is an automated notification from the Payday Express HR system.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send test email to verify configuration
   */
  async sendTestEmail(toEmail) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized');
      }

      const mailOptions = {
        from: process.env.SMTP_USER || 'noreply@paydayexpress.ca',
        to: toEmail,
        subject: 'Email Service Test - Payday Express',
        html: `
          <h1>Email Service Test</h1>
          <p>This is a test email to verify that the email service is working correctly.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Test email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Test email failed:', error.message);
      return false;
    }
  }
}

module.exports = EmailService; 