import pool from "../../lib/db";
import { withAuth } from "../../lib/middleware";

async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    //so this casting prevent overflow on huge numbers, and also handle more easy at statsdashboard ::int
    const queryText = `
        SELECT
            COUNT(*)::int AS total_registered,
            COUNT(*) FILTER (WHERE status = 'Arrived')::int AS total_arrived,
            COUNT(*) FILTER (WHERE status = 'Pending')::int AS total_pending
        FROM attendees;
    `;

    const result = await pool.query(queryText);

    return res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error('Something went wrong with stats: ', error);
    return res.status(500).json({message: 'Error retrieving statistics'});
  }

}

export default withAuth(handler);
