
import mongoose from "mongoose";
import User from "./models/user.model.js";
import bcrypt from "bcrypt";
import { env } from "./conf/env.js";
import dotenv from "dotenv";


dotenv.config();

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

  const exists = await User.findOne({ username:process.env.ADMIN_USERNAME});
  if (!exists) {
    await User.create({ username:process.env.ADMIN_USERNAME, password: hashed });
    console.log("Admin user created");
  } else {
    console.log("Admin already exists");
  }

  mongoose.disconnect();
};

 export default seedAdmin;
