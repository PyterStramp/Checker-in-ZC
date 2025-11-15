"use client";
import pool from "../../../lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Credenciales faltantes" });
  }
  try {
    //find

    const poolres = await pool.query(
      "SELECT volunteer_id, full_name, is_admin, password_hash FROM volunteers WHERE username = $1",
      [username]
    );

    if (poolres.rows.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const volunteer = poolres.rows[0];

    //match
    const matchB = await bcrypt.compare(password, volunteer.password_hash);

    if (!matchB) {
      return res.status(401).json({ message: "Credenciales faltantes" });
    }

    //jwt

    const payload = {
      volunteer_id: volunteer.volunteer_id,
      full_name: volunteer.full_name,
      is_admin: volunteer.is_admin,
    };

    //sign

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      token,
      user: {
        full_name: volunteer.full_name,
        is_admin: volunteer.is_admin,
      },
    });
  } catch (err) {
    console.error("Something went wrong with login: ", err);
    res.status(500).json({ message: "Something went wrong" });
  }
}
