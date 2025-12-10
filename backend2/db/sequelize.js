import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const dialect =
  process.env.DB_TYPE?.toLowerCase() === "mysql" ? "mysql" : "postgres";

// Choose the correct connection string
const connectionString =
  process.env[dialect === "mysql" ? "MYSQL_URI" : "POSTGRES_URI"];

if (!connectionString) {
  throw new Error(
    "❌ Database connection URI is not set. Please define MYSQL_URI or POSTGRES_URI."
  );
}

// Initialize Sequelize
export const sequelize = new Sequelize(connectionString, {
  dialect,
  logging: false,
  dialectOptions: {
    supportBigNumbers: true,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
  pool: {
    max: 10,
    min: 0,
    idle: 10000,
  },
  retry: {
    match: [/Deadlock/i],
    max: 3,
  },
});

// Test DB connection
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(
      `✅ Connected to ${dialect.toUpperCase()} database successfully`
    );
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};
