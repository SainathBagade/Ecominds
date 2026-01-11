const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || process.env.MONGO_URL;

    if (!uri) {
      throw new Error('MONGO_URI or MONGO_URL is missing in environment variables');
    }

    // Fix: Ensure database name is in the URI if missing
    if (!uri.includes('mongodb.net/') && !uri.includes('localhost')) {
      // This might be a basic string, let's leave it. 
      // User has: mongodb+srv://...@cluster.mongodb.net/?appName=...
      // We want: mongodb+srv://...@cluster.mongodb.net/EcoMinds?appName=...
      if (uri.includes('mongodb.net/?')) {
        uri = uri.replace('mongodb.net/?', 'mongodb.net/EcoMinds?');
        console.log('🔧 Auto-fixed MongoDB URI to include database name: EcoMinds');
      }
    }

    console.log(`📡 Connecting to MongoDB...`);

    const conn = await mongoose.connect(uri, {
      // timeouts to avoid infinite buffering
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', err => {
      console.error('❌ MongoDB Connection Error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB Disconnected');
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;