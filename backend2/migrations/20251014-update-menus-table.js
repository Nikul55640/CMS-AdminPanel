'use strict';

export async function up(queryInterface, Sequelize) {
  const table = await queryInterface.describeTable('menus');

  // Remove old isActive column if it exists
  if (table.isActive) {
    await queryInterface.removeColumn('menus', 'isActive');
  }

  // Add activeMenuId column if it doesn't exist
  if (!table.active_menu_id) {
    await queryInterface.addColumn('menus', 'active_menu_id', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Stores active menu ID or "custom" for this section',
    });
  }
}

export async function down(queryInterface, Sequelize) {
  // Rollback: add isActive back
  await queryInterface.addColumn('menus', 'isActive', {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  });

  // Remove activeMenuId column
  await queryInterface.removeColumn('menus', 'active_menu_id');
}
