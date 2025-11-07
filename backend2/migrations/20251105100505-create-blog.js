// migrations/20251105154000-create-blog.js

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("blogs", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
      allowNull: true,
    },
    content: {
      type: Sequelize.TEXT("long"),
      allowNull: false,
    },
    image_url: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "",
    },
    author: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "Admin",
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "General",
    },
    tags: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: [],
    },
    status: {
      type: Sequelize.ENUM("draft", "published", "scheduled"),
      allowNull: false,
      defaultValue: "draft",
    },
    publishedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("blogs");
}
