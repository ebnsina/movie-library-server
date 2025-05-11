import mongoose from "mongoose";

/**
 * Connect to MongoDB using the environment variables
 * @returns {Promise} Mongoose connection promise
 */

const DATABASE_URL = process.env.MONGODB_URI;
if (!DATABASE_URL) {
  console.warn("WARNING: Please set DATABASE_URL url on your .env!");
}

export async function connectToDb() {
  try {
    const conn = await mongoose.connect(DATABASE_URL);
    console.log(`Database connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error in database connection: ${error.message}`);
    process.exit(1);
  }
}
