import "dotenv/config";
import mongoose from "mongoose";

const username = encodeURIComponent(process.env.DB_USER);
const password = encodeURIComponent(process.env.DB_PASS);

const uri = `mongodb+srv://${username}:${password}@cluster0.2i3rf8o.mongodb.net/shopease_db?appName=Cluster0`;

const connectDatabase = async () => {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDatabase;
