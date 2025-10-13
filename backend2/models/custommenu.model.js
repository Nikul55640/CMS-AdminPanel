// src/models/customContent.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db/sequelize.js";

const CustomContent = sequelize.define(
  "CustomContent",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    section: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // ensures one record per section (e.g., navbar/footer)
    },
    html: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    css: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    js: {
      type: DataTypes.TEXT,
      allowNull: true, // added JS support
    },
    activeMenuId: {
      type: DataTypes.STRING,
      allowNull: true, // store currently active menu ID
    },
  },
  {
    tableName: "custom_contents",
    timestamps: true,
  }
);

export default CustomContent;
