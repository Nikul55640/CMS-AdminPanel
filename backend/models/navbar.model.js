import { DataTypes } from "sequelize";
import { sequelize } from "../db/sequelize.js";

const NavbarSettings = sequelize.define(
  "NavbarSettings",
  {
    logo: { type: DataTypes.STRING },
    bg: { type: DataTypes.STRING, defaultValue: "#1f2937" },
    text: { type: DataTypes.STRING, defaultValue: "#ffffff" },
    hover: { type: DataTypes.STRING, defaultValue: "#facc15" },
    fontSize: { type: DataTypes.STRING, defaultValue: "16px" },
    align: { type: DataTypes.STRING, defaultValue: "left" },
    customClass: { type: DataTypes.STRING, defaultValue: "" },
    sticky: { type: DataTypes.BOOLEAN, defaultValue: false },
    showLogin: { type: DataTypes.BOOLEAN, defaultValue: false },
    showSearch: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: "navbar_settings",
    timestamps: true,
  }
);

export default NavbarSettings;
