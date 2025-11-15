import pool from "../../../lib/db";
import { withAuth } from "../../../lib/middleware";

async function handler(req, res) {
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!req.volunteer.is_admin) {
      return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const queryText = `
      SELECT 
        i.log_id, 
        i.issue_type, 
        i.issue_details, 
        i.student_reference, 
        i.report_time,
        v.full_name as reporter_name
      FROM issue_logs i
      JOIN volunteers v ON i.reported_by = v.volunteer_id
      ORDER BY i.report_time DESC
      LIMIT 100;
    `;

    const result = await pool.query(queryText);
    return res.status(200).json(result.rows);

  } catch (error) {
    console.error('Admin Logs Error:', error);
    return res.status(500).json({ message: 'Error retrieving logs.' });
  }
}

export default withAuth(handler);
