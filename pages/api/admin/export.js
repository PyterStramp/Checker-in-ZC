import pool from "../../../lib/db";
import { withAuth } from "../../../lib/middleware";

function escapeCSV(str) {
    if (str === null || str === undefined) return '';
    const s = String(str);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    if (!req.volunteer.is_admin) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const { status } = req.query;
    const statuses = status ? status.split(',') : ['Arrived', 'Pending'];

    try {
        const queryText = `
            SELECT full_name, uni_name, uni_id, email, phone, ieee_membership, status, check_in_time
            FROM attendees
            WHERE status = ANY($1::varchar[])
            ORDER BY full_name;
        `;
        
        const result = await pool.query(queryText, [statuses]);
        const attendees = result.rows;

        const headers = [
            'Full Name', 'University', 'ID', 'Email', 'Phone', 
            'IEEE Membership', 'Status', 'Check-in Time'
        ];

        let csv = headers.join(';') + '\n';
        
        attendees.forEach(row => {
            const values = [
                escapeCSV(row.full_name),
                escapeCSV(row.uni_name),
                escapeCSV(row.uni_id),
                escapeCSV(row.email),
                escapeCSV(row.phone),
                escapeCSV(row.ieee_membership),
                escapeCSV(row.status),
                escapeCSV(row.check_in_time ? new Date(row.check_in_time).toLocaleString() : 'N/A')
            ];
            csv += values.join(';') + '\n';
        });  
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="attendee_export.csv"');
        res.status(200).send(csv);

    } catch (error) {
        console.error('CSV Export Error:', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
}

export default withAuth(handler);
