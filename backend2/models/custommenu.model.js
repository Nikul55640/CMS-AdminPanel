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
      type: DataTypes.ENUM("navbar", "footer"),
      allowNull: false,
    },
    html: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    css: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "custom_contents",
    timestamps: true,
  }
);

export default CustomContent;
