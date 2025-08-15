import mongoose from 'mongoose';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

if (!DB_NAME) {
  throw new Error('DB_NAME environment variable is required');
}

// Global cached connection
if (!global.__mongooseConn) {
  global.__mongooseConn = null;
}

export async function connectMongo() {
  if (global.__mongooseConn) {
    return global.__mongooseConn;
  }

  try {
    const connection = await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    });

    global.__mongooseConn = connection;
    console.log('✅ MongoDB connected');
    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

export default connectMongo;
