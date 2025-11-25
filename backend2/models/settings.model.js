import { DataTypes } from "sequelize";
import { sequelize } from "../db/sequelize.js";

const Settings = sequelize.define(
  "Settings",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      comment: "Settings key (e.g., 'theme', 'siteName')",
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Settings value (JSON stringified)",
    },
  },
  {
    timestamps: true,
    tableName: "settings",
  }
);

export default Settings;
