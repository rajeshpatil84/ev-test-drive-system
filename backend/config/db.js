const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ev-test-drive';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected:', mongoURI);
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('Make sure MongoDB is running or update MONGODB_URI in .env');
    process.exit(1);
  }
};

module.exports = connectDB;
