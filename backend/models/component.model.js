import { DataTypes } from "sequelize";
import { sequelize } from "../db/sequelize.js";

const Component = sequelize.define(
  "Component",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
    order: {
      // ✅ Add this column
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "components",
    timestamps: true,
  }
);

export default Component;
