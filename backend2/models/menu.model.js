// src/models/menu.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db/sequelize.js";
import Page from "./page.model.js"; // Assuming you have a Page model

const Menu = sequelize.define(
  "Menu",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.ENUM("navbar", "footer", "none"),
      defaultValue: "none",
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    openInNewTab: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Indicates if this menu is the currently active one
    },
    activeMenuId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "active_menu_id", // map to snake_case column
    },
    
  },
  {
    tableName: "menus",
    timestamps: true,
  }
);

// ----------------- Associations -----------------

// Link to internal page
Menu.belongsTo(Page, { foreignKey: "pageId", onDelete: "SET NULL" });
Page.hasMany(Menu, { foreignKey: "pageId" });

// Self-referencing for nested menus
Menu.hasMany(Menu, {
  as: "children",
  foreignKey: "parentId",
  onDelete: "CASCADE", // Deletes children when parent is removed
});
Menu.belongsTo(Menu, { as: "parent", foreignKey: "parentId" });

export default Menu;
