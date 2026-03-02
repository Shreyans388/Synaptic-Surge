import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    const mongoDbName = process.env.MONGODB_DB_NAME ?? "social_publisher";

    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(mongoUri, { dbName: mongoDbName });

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("MongoDB connection is established but database handle is unavailable");
    }
    const brandsCollection = db.collection("brands");
    const indexes = await brandsCollection.indexes();
    const hasLegacyNameIndex = indexes.some((idx) => idx.name === "name_1");

    if (hasLegacyNameIndex) {
      await brandsCollection.dropIndex("name_1");
      console.log("Dropped legacy brands index: name_1");
    }

    console.log(`Connected to MongoDB database: ${mongoDbName}`);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
