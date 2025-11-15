import pool from "../../../lib/db";
import { withAuth } from "../../../lib/middleware";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { id } = req.query;
  const volunteer_id = req.volunteer.volunteer_id;

  if (!id) {
    return res.status(400).json({ message: "Attendee ID is required" });
  }

  //this is a single connection
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    //this basically prevents the race condition
    const checkRes = await client.query(
      `SELECT status, full_name FROM attendees WHERE attendee_id = $1 FOR UPDATE`,
      [id]
    );

    if (checkRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Attendee not found" });
    }

    const attendee = checkRes.rows[0];

    if (attendee.status === "Arrived") {
      await client.query("ROLLBACK");
      // conflict
      return res.status(409).json({
        message: `Warning: ${attendee.full_name} has already been checked in!`,
      });
    }

    await client.query(
      `UPDATE attendees 
       SET status = 'Arrived', 
           check_in_time = NOW(), 
           checked_in_by = $1 
       WHERE attendee_id = $2`,
      [volunteer_id, id]
    );

    await client.query("COMMIT");

    // it was successfull
    return res.status(200).json({
      message: "Check-in successful",
      attendeeId: id,
      status: "Arrived",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Check-in Transaction Error:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong during check-in" });
  } finally {
    client.release();
  }
}

export default withAuth(handler);
