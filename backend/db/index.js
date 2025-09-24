import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { DB_NAME } from "../constants.js";

dotenv.config();

const sequelize = new Sequelize(
  process.env.ENVIRONMENT === "production"
    ? DB_NAME
    : process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
    logging: false, // set true to see raw SQL logs
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected via Sequelize");
  } catch (error) {
    console.error("❌ MySQL connection error:", error);
    process.exit(1);
  }
};

export default sequelize;
