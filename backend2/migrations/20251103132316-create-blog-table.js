export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("Blogs", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    slug: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: Sequelize.TEXT,
    },
    content: {
      type: Sequelize.TEXT("long"),
      allowNull: false,
    },
    imageUrl: {
      type: Sequelize.STRING,
    },
    author: {
      type: Sequelize.STRING,
      defaultValue: "Admin",
    },
    category: {
      type: Sequelize.STRING,
      defaultValue: "General",
    },
    tags: {
      type: Sequelize.JSON,
      defaultValue: [],
    },
    status: {
      type: Sequelize.ENUM("draft", "published"),
      defaultValue: "draft",
    },
    publishedAt: {
      type: Sequelize.DATE,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("Blogs");
}
