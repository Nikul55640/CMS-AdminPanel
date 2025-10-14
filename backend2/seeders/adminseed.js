import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import {sequelize} from "../db/sequelize.js"; // default export
import User from "../models/user.model.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to DB
    await sequelize.authenticate();
    console.log("✅ Connected to MySQL");

    // Sync models (optional: { alter: true } will update schema without dropping data)
    await sequelize.sync();

    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
      throw new Error("❌ ADMIN_USERNAME or ADMIN_PASSWORD is not set in .env");
    }

    // Check if admin exists
    const existingAdmin = await User.findOne({ where: { username } });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        username,
        password: hashedPassword,
      });
      console.log("✅ Admin user created successfully");
    } else {
      console.log("ℹ️ Admin already exists");
    }
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  } finally {
    // Close DB connection safely
    try {
      await sequelize.close();
      console.log("🔌 Database connection closed");
    } catch (err) {
      console.error("❌ Error closing database connection:", err);
    }
  }
};

// Run seeder if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAdmin().then(() => {
    console.log("✅ Seeding process finished");
    process.exit(0);
  });
}

export default seedAdmin;
