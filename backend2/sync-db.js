import Content from "./models/content.model.js";
import { sequelize } from "./db/sequelize.js";

const syncDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await Content.sync({ alter: true }); // Creates table if not exists
    console.log("✅ Content table synced");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to sync DB:", err);
    process.exit(1);
  }
};

syncDB();
