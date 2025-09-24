// sync-db.js
import {sequelize} from "./db/sequelize.js";
import Page from "./models/page.model.js";  
import Component from "./models/component.model.js";

const syncDB = async () => {
  try {
    // Sync both tables, alter = true will add missing columns
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced successfully!");
  } catch (err) {
    console.error("❌ Error syncing database:", err);
  } finally {
    await sequelize.close();
  }
};

syncDB();
