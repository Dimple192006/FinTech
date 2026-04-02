import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("DB Connected");
    return true;
  } catch (error) {
    console.log("DB Error", error.message);
    return false;
  }
};

export default connectDB;
