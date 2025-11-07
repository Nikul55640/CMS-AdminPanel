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
      unique: true, // ensures one record per section (e.g., "navbar", "footer")
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
      allowNull: true, // allows storing JS for that section
    },

    activeMenuId: {
      type: DataTypes.STRING,
      allowNull: true, // store currently active menu ID
    },

    // 🖼️ Logo field (store path or URL)
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Stores logo URL or file path for navbar/footer",
    },
  },
  {
    tableName: "custom_contents",
    timestamps: true,
  }
);

export default CustomContent;
