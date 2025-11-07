export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("custom_contents", "menuType");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("custom_contents", "menuType", {
      type: Sequelize.ENUM("manual", "custom"),
      allowNull: false,
      defaultValue: "manual",
      comment: "Defines whether menu is manually created or custom HTML",
    });
  },
};
