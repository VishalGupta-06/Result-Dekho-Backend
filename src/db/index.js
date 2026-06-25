import mongoose, { connect } from "mongoose";

const connectDB = async () => {
  try {
    const connected = await mongoose.connect(process.env.DB_URI, {
      dbName: process.env.DB_NAME,
    });

    console.log(
      `\n MongoDB connected !! DB HOST : ${connected.connection.host}`,
    );
  } catch (error) {
    console.log(" dataBase is not CONNECTED ", error);
    process.exit(1);
  }
};

export default connectDB;
