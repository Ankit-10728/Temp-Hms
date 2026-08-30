const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn('MONGO_URI is not set. Server will start without DB connection.');
    return;
  }

  const dnsServers = (process.env.MONGO_DNS_SERVERS || '8.8.8.8,1.1.1.1')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (uri.startsWith('mongodb+srv://') && dnsServers.length > 0) {
    dns.setServers(dnsServers);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // For local dev, don't crash the whole server if MongoDB is unreachable.
    // API endpoints depending on DB will still fail, but frontend can load.
  }
};

module.exports = connectDB;
