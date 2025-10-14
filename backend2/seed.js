// seed.js
import seedAdmin from "./seeders/adminseed.js";

(async () => {
  try {
    await seedAdmin();
    console.log("✅ Seeding finished");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
})();
