import seedAdmin from "./controllers/adminseed.js"

seedAdmin().then(() => {
  console.log("Seeding finished");
  process.exit(0);
});