import jwt from "jsonwebtoken";
import Cookies from "js-cookie"; //not used yet but good practice use it for later

const JWT_SECRET = process.env.JWT_SECRET;

export const withAuth = (handler) => async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authentication required. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.volunteer = decoded;

    return handler(req, res);
  } catch (error) {
    console.error("JWT Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
