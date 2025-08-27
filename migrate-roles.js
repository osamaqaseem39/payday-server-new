const mongoose = require('mongoose');
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
    
    // Find users with invalid role values
    const invalidUsers = await usersCollection.find({
      role: { $in: ["hr_staff", "hr_manager", "interviewer"] }
    }).toArray();
    
    console.log(`Found ${invalidUsers.length} users with invalid roles:`);
    invalidUsers.forEach(user => {
      console.log(`- ${user.email}: ${user.role}`);
    });
    
    if (invalidUsers.length > 0) {
      // Update all invalid roles to "user"
      const result = await usersCollection.updateMany(
        { role: { $in: ["hr_staff", "hr_manager", "interviewer"] } },
        { $set: { role: "user" } }
      );
      
      console.log(`Updated ${result.modifiedCount} users to role "user"`);
    } else {
      console.log('No users with invalid roles found');
    }
    
    // Also check for users with missing name field
    const usersWithoutName = await usersCollection.find({
      $or: [
        { name: { $exists: false } },
        { name: null },
        { name: "" }
      ]
    }).toArray();
    
    console.log(`Found ${usersWithoutName.length} users without name field:`);
    usersWithoutName.forEach(user => {
      console.log(`- ${user.email}: name = ${user.name}`);
    });
    
    if (usersWithoutName.length > 0) {
      // Update users without name to use email as name
      const result = await usersCollection.updateMany(
        { $or: [
          { name: { $exists: false } },
          { name: null },
          { name: "" }
        ]},
        [{ $set: { name: "$email" } }]
      );
      
      console.log(`Updated ${result.modifiedCount} users to use email as name`);
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('Migration completed');
  }
}); 