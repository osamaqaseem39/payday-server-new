require('dotenv').config();
const EmailService = require('./src/services/EmailService');

async function testEmailService() {
  console.log('🧪 Testing Email Service...');
  
  try {
    const emailService = new EmailService();
    
    // Wait a bit for the transporter to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('📧 Sending test email...');
    
    // Test email to a real address (replace with your email)
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    
    const result = await emailService.sendTestEmail(testEmail);
    
    if (result) {
      console.log('✅ Email service test successful!');
      console.log('📧 Test email sent to:', testEmail);
    } else {
      console.log('❌ Email service test failed');
    }
    
  } catch (error) {
    console.error('❌ Email service test error:', error.message);
  }
}

// Run the test
testEmailService(); 