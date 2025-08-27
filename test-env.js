require('dotenv').config();
const jwt = require('jsonwebtoken');

console.log('🔍 Testing environment variables...');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'NOT SET');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

// Test JWT functionality
if (process.env.JWT_SECRET) {
  try {
    const testPayload = { userId: 'test', email: 'test@test.com', role: 'admin' };
    const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log('✅ JWT token generated successfully');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT token verified successfully');
    console.log('Decoded payload:', decoded);
  } catch (error) {
    console.error('❌ JWT test failed:', error.message);
  }
} else {
  console.log('⚠️ JWT_SECRET not set, using fallback');
  try {
    const testPayload = { userId: 'test', email: 'test@test.com', role: 'admin' };
    const token = jwt.sign(testPayload, 'your-secret-key', { expiresIn: '24h' });
    console.log('✅ JWT token generated with fallback secret');
    
    const decoded = jwt.verify(token, 'your-secret-key');
    console.log('✅ JWT token verified with fallback secret');
  } catch (error) {
    console.error('❌ JWT test failed:', error.message);
  }
}

console.log('✅ Environment test completed'); 