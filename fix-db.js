const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kgl';

async function fixDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Drop all indexes except _id
    console.log('Dropping old indexes...');
    try {
      await usersCollection.dropIndexes();
      console.log('✓ Indexes dropped');
    } catch (e) {
      console.log('(No indexes to drop)');
    }
    
    // Drop the collection
    console.log('Dropping users collection...');
    try {
      await usersCollection.drop();
      console.log('✓ Collection dropped');
    } catch (e) {
      console.log('(Collection already empty)');
    }
    
    // Close connection
    await mongoose.disconnect();
    console.log('✓ Database cleanup complete!');
    console.log('✓ You can now register users without errors');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixDatabase();
