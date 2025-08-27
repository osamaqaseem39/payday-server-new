require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testDatabase() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Test user collection
    const usersCollection = mongoose.connection.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`📊 Found ${userCount} users in database`);
    
    // Check for admin user
    const adminUser = await usersCollection.findOne({ role: 'admin' });
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.email);
      
      // Test authentication
      const testPassword = 'admin123';
      const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password);
      console.log('🔐 Password test:', isPasswordValid ? 'Valid' : 'Invalid');
      
      if (isPasswordValid) {
        // Test JWT generation
        const payload = {
          userId: adminUser._id.toString(),
          email: adminUser.email,
          role: adminUser.role
        };
        
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const token = jwt.sign(payload, secret, { expiresIn: '24h' });
        console.log('✅ JWT token generated for admin user');
        
        // Test JWT verification
        const decoded = jwt.verify(token, secret);
        console.log('✅ JWT token verified successfully');
        console.log('Decoded payload:', decoded);
      }
    } else {
      console.log('⚠️ No admin user found');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

testDatabase(); 