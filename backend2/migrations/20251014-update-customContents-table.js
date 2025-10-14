'use strict';

export async function up(queryInterface, Sequelize) {
  const table = await queryInterface.describeTable('custom_contents');

  // Add activeMenuId if it doesn't exist
  if (!table.active_menu_id) {
    await queryInterface.addColumn('custom_contents', 'active_menu_id', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Stores active menu ID or "custom" for this section',
    });
  }
}

export async function down(queryInterface, Sequelize) {
  // Rollback: remove the column
  await queryInterface.removeColumn('custom_contents', 'active_menu_id');
}
