import { DataTypes } from "sequelize";
import { sequelize } from "../db/sequelize.js";

const Content = sequelize.define(
  "Content",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // unique identifier for each page/component
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    html: {
      type: DataTypes.TEXT("long"),
      defaultValue: "",
    },
    css: {
      type: DataTypes.TEXT("long"),
      defaultValue: "",
    },
    js: {
      type: DataTypes.TEXT("long"),
      defaultValue: "",
    },
  },
  {
    tableName: "contents",
    timestamps: true, // createdAt and updatedAt
  }
);

export default Content;
