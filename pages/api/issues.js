import pool from "../../lib/db";
import { withAuth } from "../../lib/middleware";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const volunteer_id = req.volunteer.volunteer_id;

  const { issue_type, issue_details, student_reference } = req.body;
  console.log(req.body.issue_type)

  if (!issue_type || !issue_details) {
    return res
      .status(400)
      .json({ message: "Issue type and details are required." });
  }

  try {
    const queryText = `
      INSERT INTO issue_logs (issue_type, issue_details, student_reference, reported_by)
      VALUES ($1, $2, $3, $4)
      RETURNING log_id, report_time;
    `;
    
    const queryParams = [
      issue_type, 
      issue_details, 
      student_reference, 
      volunteer_id
    ];

    await pool.query(queryText, queryParams);

    return res.status(201).json({ message: 'Issue logged successfully.' });
  } catch (error) {
    console.error('Issue Log Error:', error);
    return res.status(500).json({ message: 'Internal Server Error while logging issue.' });
  }
}

export default withAuth(handler);
