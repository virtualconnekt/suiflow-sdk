import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing MongoDB connection...');
console.log('Connection string:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    console.log('Connected to database:', mongoose.connection.name);
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
  });