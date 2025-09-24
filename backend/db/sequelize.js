import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const dialect = process.env.DB_TYPE?.toLowerCase() === "mysql" ? "mysql" : "postgres";

// Choose the correct connection string
const connectionString =
  process.env[dialect === "mysql" ? "MYSQL_URI" : "POSTGRES_URI"];

if (!connectionString) {
  throw new Error("❌ Database connection URI is not set. Please define MYSQL_URI or POSTGRES_URI.");
}

// Initialize Sequelize
export const sequelize = new Sequelize(connectionString, {
  dialect,
  logging: false, // ✅ Turn on for debugging queries
  define: {
    timestamps: true, // adds createdAt/updatedAt automatically
    underscored: true, // optional: converts camelCase → snake_case in DB
  },
});

// Test DB connection
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Connected to ${dialect.toUpperCase()} database successfully`);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};
