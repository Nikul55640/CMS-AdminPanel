// src/models/page.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db/sequelize.js";

const Page = sequelize.define(
  "Page",
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
    slug: {
      type: DataTypes.STRING(191), // reduced length
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    html: {
      type: DataTypes.TEXT("long"),
    },
    css: {
      type: DataTypes.TEXT("long"),
    },
    js: {
      type: DataTypes.TEXT("long"),
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "draft",
    },
    metaTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metaDescription: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    keywords: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "pages",
    timestamps: true,
  }
);

export default Page;
