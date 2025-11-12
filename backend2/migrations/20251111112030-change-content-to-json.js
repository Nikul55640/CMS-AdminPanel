// migrations/20251111121500-update-blog-model.js

export async function up(queryInterface, Sequelize) {
  // 🧹 Step 1: Clean invalid JSON values before conversion (if column already existed)
  try {
    await queryInterface.sequelize.query(
      "UPDATE blogs SET content = '{}' WHERE content = '' OR content IS NULL;"
    );
  } catch (err) {
    console.warn("⚠️ Skipped cleaning `content` column:", err.message);
  }

  try {
    await queryInterface.sequelize.query(
      "UPDATE blogs SET imageUrl = '' WHERE imageUrl IS NULL;"
    );
  } catch (err) {
    console.warn("⚠️ Skipped cleaning `imageUrl` column:", err.message);
  }

  // 🛠️ Step 2: Modify column types
  await queryInterface.changeColumn("blogs", "content", {
    type: Sequelize.JSON,
    allowNull: false,
    defaultValue: {},
  });

  await queryInterface.changeColumn("blogs", "imageUrl", {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: "",
  });

  await queryInterface.changeColumn("blogs", "tags", {
    type: Sequelize.JSON,
    allowNull: true,
    defaultValue: [],
  });

  console.log("✅ Migration completed: blog model updated");
}

export async function down(queryInterface, Sequelize) {
  // 🔙 Revert changes if needed
  await queryInterface.changeColumn("blogs", "content", {
    type: Sequelize.TEXT("long"),
    allowNull: false,
  });

  await queryInterface.changeColumn("blogs", "imageUrl", {
    type: Sequelize.STRING,
    allowNull: true,
  });

  await queryInterface.changeColumn("blogs", "tags", {
    type: Sequelize.STRING,
    allowNull: true,
  });

  console.log("🔙 Reverted blog model changes");
}
