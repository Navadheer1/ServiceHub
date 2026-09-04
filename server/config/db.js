import mongoose from 'mongoose';

/**
 * Connects to MongoDB with enhanced error handling and IPv4 forcing.
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGO_URI is not defined in .env file');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoURI, {
      // These options ensure stable connection behavior
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      socketTimeoutMS: 45000,         // Close sockets after 45s
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Monitor connection for runtime issues
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB Runtime Error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB Disconnected. Attempting to reconnect...');
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('👉 Tip: Ensure your local MongoDB service is running (mongod).');
      console.error('👉 Tip: If using localhost, try 127.0.0.1 in MONGO_URI.');
    }
    
    // Rethrow to allow server startup to handle the failure
    throw error;
  }
};

export default connectDB;
