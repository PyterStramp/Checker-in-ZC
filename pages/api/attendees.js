import pool from "../../lib/db";
import { withAuth } from "../../lib/middleware";

async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const searchTerm = req.query.q || "";
  let queryText = `
        SELECT 
            attendee_id, full_name, uni_name, uni_id, status, check_in_time
        FROM attendees
    `;
  let queryParams = [];

  if (searchTerm) {
    queryText += `
            WHERE uni_id = $1 OR full_name ILIKE $2
        `;
    queryParams = [
      searchTerm,
      `%${searchTerm}%`,
    ];
  }

  queryText += ` ORDER BY full_name ASC LIMIT 500;`;

  try {
    const result = await pool.query(queryText, queryParams);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Attendee List Error:', error);
    return res.status(500).json({ message: 'Error retrieving attendee list.' });
  }
}

export default withAuth(handler);
