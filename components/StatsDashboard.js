import useSWR from "swr";
import { useAuth } from "../context/AuthContext";

const fetcher = (url, token) => 
  fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.json());

export default function StatsDashboard() {
    const { user } = useAuth();

    const { data, error } = useSWR(
        user ? ['/api/stats', user.token] : null,
        ([url, token]) => fetcher(url, token),
        {
            refreshInterval: 2000, // every 2 seconds for a feeling of real-time updates
            revalidateOnFocus: true,
        }
    );

    if (error) return <div className="text-red-500 text-sm">Stats unavailable</div>;
    
    // 0 while loading
    const stats = data || { total_registered: 0, total_arrived: 0, total_pending: 0 };

    const percentage = stats.total_registered > 0 
        ? Math.round((stats.total_arrived / stats.total_registered) * 100) 
        : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                <p className="text-gray-500 text-sm font-medium uppercase">Checked In</p>
                <p className="text-3xl font-bold text-green-600">{stats.total_arrived}</p>
                <p className="text-xs text-gray-400 mt-1">{percentage}% of total</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
                <p className="text-gray-500 text-sm font-medium uppercase">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.total_pending}</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
                <p className="text-gray-500 text-sm font-medium uppercase">Total Registered</p>
                <p className="text-3xl font-bold text-purple-600">{stats.total_registered}</p>
            </div>
        </div>
    );
}
