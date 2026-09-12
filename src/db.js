import mongoose from 'mongoose';
import config from './config.js';

/**
 * Connect to MongoDB instance
 * @param {string} [uri] Optional custom MongoDB URI
 */
export async function connectDB(uri = config.mongoUri) {
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error:`, error.message);
    throw error;
  }
}

/**
 * Disconnect from MongoDB instance
 */
export async function disconnectDB() {
  await mongoose.disconnect();
}
