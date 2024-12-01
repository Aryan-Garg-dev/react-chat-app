import  mongoose from "mongoose"
import "dotenv/config"

const MONGODB_URI = process.env.MONGODB_URI;

export const connectDB = async ()=>{
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    const { host, name } = conn.connection;
    console.log(`MongoDB connected: ${host}`);
    console.log(`DBName: ${name}`);
  } catch (error){
    console.log("MongoDB Connection Error\n", error);
    process.exit(1);
  }
}