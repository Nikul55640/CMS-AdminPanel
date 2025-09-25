import { DataTypes } from "sequelize";
import { sequelize } from "../db/sequelize.js";
import Page from "./page.model.js";

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
