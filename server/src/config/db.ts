import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expensecalc';
  try {
    console.log(`[Database] Connecting to MongoDB at ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[Database] MongoDB connected successfully.');
  } catch (err: any) {
    console.error(`[Database] MongoDB connection failed: ${err.message}`);
    console.warn('[Database] Note: Ensure MongoDB service is running (e.g. `mongod` or Docker).');
  }
};
