export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("blogs", "seoTitle", {
    type: Sequelize.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn("blogs", "seoDescription", {
    type: Sequelize.TEXT,
    allowNull: true,
  });

  await queryInterface.addColumn("blogs", "urlHandle", {
    type: Sequelize.STRING,
    allowNull: true,
    unique: true,
  });

  const table = await queryInterface.describeTable("blogs");
  if (!table.imageUrl && table.image_url) {
    await queryInterface.renameColumn("blogs", "image_url", "imageUrl");
  } else if (!table.imageUrl) {
    await queryInterface.addColumn("blogs", "imageUrl", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "",
    });
  }
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("blogs", "seoTitle");
  await queryInterface.removeColumn("blogs", "seoDescription");
  await queryInterface.removeColumn("blogs", "urlHandle");

  const table = await queryInterface.describeTable("blogs");
  if (table.imageUrl && !table.image_url) {
    await queryInterface.renameColumn("blogs", "imageUrl", "image_url");
  }
}
