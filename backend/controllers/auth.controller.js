import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Unauthorized" });

  const token = jwt.sign({ id: user._id, username }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
 console.log(token) 
  res.json({ token });
};
