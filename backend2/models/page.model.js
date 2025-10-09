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
      type: DataTypes.STRING,
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
      // ✅ Add status column
      type: DataTypes.STRING,
      defaultValue: "draft",
    },
    metaTitle: {
      // ✅ Optional meta fields
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
