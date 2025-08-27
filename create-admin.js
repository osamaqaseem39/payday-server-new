const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Get the users collection
    const usersCollection = db.collection('users');
    
    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
    } else {
      // Create admin user
      const adminPassword = 'admin123'; // Change this to a secure password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const adminUser = {
        name: 'Admin User',
        email: 'admin@payday.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await usersCollection.insertOne(adminUser);
      
      console.log('✅ Admin user created successfully!');
      console.log('Email: admin@payday.com');
      console.log('Password: admin123');
      console.log('User ID:', result.insertedId);
    }
    
  } catch (error) {
    console.error('Failed to create admin user:', error);
  } finally {
    mongoose.connection.close();
    console.log('Script completed');
  }
}); 