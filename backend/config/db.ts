import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ev-test-drive';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected:', mongoURI);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', (error as Error).message);
    console.error('Make sure MongoDB is running or update MONGODB_URI in .env');
    process.exit(1);
  }
};

export default connectDB;
