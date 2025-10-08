// src/models/user.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db/sequelize.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(191), // VARCHAR(191) works for utf8mb4 with indexes
      allowNull: false,
      unique: true, // Sequelize will use the existing unique index
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

export default User;
