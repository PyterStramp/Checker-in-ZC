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
        const queryText =`
        SELECT 
            v.volunteer_id,
            v.full_name,
            COALESCE(ci.checkin_count, 0)::int AS checkin_count,
            COALESCE(ir.issue_count, 0)::int AS issue_count
        FROM volunteers v
            
        LEFT JOIN (
            SELECT checked_in_by, COUNT(*) as checkin_count
            FROM attendees
            WHERE checked_in_by IS NOT NULL
            GROUP BY checked_in_by
        ) AS ci ON v.volunteer_id = ci.checked_in_by
            
        LEFT JOIN (
            SELECT reported_by, COUNT(*) as issue_count
            FROM issue_logs
            GROUP BY reported_by
        ) AS ir ON v.volunteer_id = ir.reported_by

        ORDER BY checkin_count DESC, issue_count DESC;
        `;

        const result = await pool.query(queryText);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Volunteer Stats Error:', error);
        return res.status(500).json({ message: 'Internal Server Error.' });
    }
}

export default withAuth(handler);
