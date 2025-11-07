export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("custom_contents", "logo", {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "Stores logo URL or file path for navbar/footer",
    });

    await queryInterface.addColumn("custom_contents", "menuType", {
      type: Sequelize.ENUM("manual", "custom"),
      allowNull: false,
      defaultValue: "manual",
      comment: "Defines whether menu is manually created or custom HTML",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("custom_contents", "logo");
    await queryInterface.removeColumn("custom_contents", "menuType");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_custom_contents_menuType";'
    );
  },
};
