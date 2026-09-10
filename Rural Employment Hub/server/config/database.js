import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

const connectDB = async (maxRetries = 3, retryDelay = 2000) => {
  let retries = 0;
  
  const attempt = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      retries++;
      if (retries < maxRetries) {
        console.warn(`⚠️  MongoDB connection attempt ${retries} failed. Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return attempt();
      } else {
        console.warn(`⚠️  MongoDB connection failed after ${maxRetries} attempts. Server will run in offline mode.`);
        console.error(`Error: ${error.message}`);
        return null;
      }
    }
  };
  
  return attempt();
};
