import pool from "../../../lib/db";
import { withAuth } from "../../../lib/middleware";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { id } = req.query;
  const volunteer_id = req.volunteer.volunteer_id;

  if (!id) {
    return res.status(400).json({ message: "Missing information" });
  }

  //this is a single connection
  const client = await pool.connect();

  try {
    //basically a similar aproach of the check-in logic

    await client.query("BEGIN");

    const checkRes = await client.query(
      `SELECT status, full_name, uni_id FROM attendees WHERE attendee_id = $1 FOR UPDATE`,
      [id]
    );

    if (checkRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Attendee not found" });
    }

    const attendee = checkRes.rows[0];

    // Well, the attendee must have a status innit

    if (attendee.status !== "Arrived") {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "Cannot revoke: Student is not checked in." });
    }

    // setting it explicitly
    await client.query(
      `UPDATE attendees 
       SET status = 'Pending', 
           check_in_time = NULL, 
           checked_in_by = NULL 
       WHERE attendee_id = $1`,
      [id]
    );

    // Loggin this action must be important in order to control or sm
    await client.query(
      `INSERT INTO issue_logs (issue_type, issue_details, student_reference, reported_by)
       VALUES ($1, $2, $3, $4)`,
      [
        "Check-in Revoked",
        `Accidental check-in revoked by volunteer.`,
        `ID: ${attendee.uni_id} | Name: ${attendee.full_name}`,
        volunteer_id,
      ]
    );

    await client.query("COMMIT");

    return res.status(200).json({ message: "Check-in revoked successfully." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Revoke Error:", error);
    return res.status(500).json({ message: "Server error during revoke." });
  } finally {
    client.release();
  }
}

export default withAuth(handler);
