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
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: true,

    },
  },
  {
    tableName: "users",
    timestamps: true, // adds createdAt and updatedAt automatically
   
    indexes: [
      {
        unique: true,
        fields: ["username"],
      },
    ],
  }

);

export default User;
