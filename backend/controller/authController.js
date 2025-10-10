import User from "../model/authModel.js";

import bcrypt from "bcryptjs";
import Employee from "../model/employeeModel.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log(email, password)
    const user = await User.findOne({ email });
    console.log(user);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res
      .status(200)
      .json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          type: user.type,
        },
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
