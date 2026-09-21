import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { runSeed } from '../scripts/seed';

dotenv.config();

const connectDB = async (): Promise<void> => {
  let uri = process.env.MONGODB_URI;
  let isMemory = false;

  if (!uri || uri.includes('USERNAME:PASSWORD')) {
    console.log('⚠️  Using in-memory MongoDB for local testing (No MONGODB_URI provided).');
    const mongoServer = await MongoMemoryServer.create();
    uri = mongoServer.getUri();
    isMemory = true;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    
    if (isMemory) {
      console.log('🌱 Seeding in-memory database...');
      await runSeed();
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
    } else {
      console.error('❌ Unknown MongoDB connection error');
    }
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

export default connectDB;
