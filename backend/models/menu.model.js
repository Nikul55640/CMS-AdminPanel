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
      // This corresponds to 'label' in our discussion
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
      // Crucial for nesting
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pageId: {
      // Allows linking to an internal page
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    order: {
      // Crucial for sorting
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "menus",
    timestamps: true,
  }
);

// ✅ Relationships
Menu.belongsTo(Page, { foreignKey: "pageId", onDelete: "SET NULL" });
Page.hasMany(Menu, { foreignKey: "pageId" });

Menu.hasMany(Menu, { as: "children", foreignKey: "parentId" });
Menu.belongsTo(Menu, { as: "parent", foreignKey: "parentId" });

export default Menu;
