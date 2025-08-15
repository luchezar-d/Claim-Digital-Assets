import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../src/models/User.js';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

async function migrateUsers() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    console.log('🔗 Connecting to MongoDB...');

    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    });

    console.log('✅ Connected to database');

    // Find all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to migrate`);

    let updatedCount = 0;

    // Process each user
    for (const user of users) {
      const originalEmail = user.email;
      const lowercaseEmail = originalEmail.toLowerCase();

      if (originalEmail !== lowercaseEmail) {
        user.email = lowercaseEmail;
        await user.save();
        updatedCount++;
        console.log(`✓ Updated email: ${originalEmail} → ${lowercaseEmail}`);
      }
    }

    // Sync indexes to ensure case-insensitive email index is applied
    console.log('🔄 Syncing indexes...');
    await User.syncIndexes();

    console.log(`✅ Migration complete! Updated ${updatedCount} user email(s)`);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

migrateUsers();
