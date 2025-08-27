require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testAuthentication() {
  console.log('🔍 Testing complete authentication flow...');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Find admin user
    const usersCollection = mongoose.connection.collection('users');
    const adminUser = await usersCollection.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }
    
    console.log('✅ Admin user found:', adminUser.email);
    
    // Test password verification
    const testPassword = 'admin123';
    const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password);
    
    if (!isPasswordValid) {
      console.log('❌ Password verification failed');
      return;
    }
    
    console.log('✅ Password verification successful');
    
    // Generate JWT token (simulate login)
    const payload = {
      userId: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role
    };
    
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(payload, secret, { expiresIn: '24h' });
    
    console.log('✅ JWT token generated');
    console.log('Token:', token.substring(0, 50) + '...');
    
    // Verify JWT token (simulate API call)
    const decoded = jwt.verify(token, secret);
    console.log('✅ JWT token verified');
    console.log('Decoded payload:', decoded);
    
    // Test authorization
    if (['admin', 'manager'].includes(decoded.role)) {
      console.log('✅ User authorized for manager/admin access');
    } else {
      console.log('❌ User not authorized for manager/admin access');
    }
    
    // Simulate API request headers
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('✅ Simulated API headers:', headers);
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

testAuthentication(); 