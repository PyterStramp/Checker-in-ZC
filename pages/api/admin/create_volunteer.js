import { withAuth } from "../../../lib/middleware";
import pool from "../../../lib/db"
import bcrypt from "bcrypt";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  if (!req.volunteer.is_admin) {
    return res.status(403).json({ message: "Forbidden: Admins only." });
  }

  const { username, password, full_name, is_admin } = req.body;

  if (!username || !password || !full_name) {
    return res.status(400).json({
      message: "All fields are required.",
    });
  }

  try {
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const queryText = `
        INSERT INTO volunteers (username, password_hash, full_name, is_admin)
        VALUES ($1, $2, $3, $4)
        RETURNING volunteer_id, username;
    `;
    
    await pool.query(queryText, [username, password_hash, full_name, is_admin || false]);

    return res.status(201).json({ message: 'Volunteer created successfully.' });
  } catch (error) {
    console.error("Create Volunteer Error:", error);

    // postgres code 23505
    if (error.code === "23505") {
      return res.status(409).json({ message: "Username already exists." });
    }

    return res.status(500).json({ message: "Internal Server Error." });
  }
}

export default withAuth(handler);
