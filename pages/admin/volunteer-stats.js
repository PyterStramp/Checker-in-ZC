import { useRouter } from "next/router";
import { useEffect } from "react";
import useSWR from "swr";
import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from '../../components/ProtectedRoute';

const fetcher = (url, token) => 
  fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json());

export default function VolunteerStats() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user && !user.is_admin) {
            router.replace('/dashboard');
        }
    }, [user, loading, router]);

    const { data: stats } = useSWR(
        (user?.is_admin) ? ['/api/admin/volunteer_stats', user.token] : null,
        ([url, token]) => fetcher(url, token)
    );

    if (loading || !user?.is_admin) return <p className="p-10">Verifying privileges...</p>;

    const totalCheckins = stats?.reduce((acc, v) => acc + v.checkin_count, 0) || 0;
    const totalIssues = stats?.reduce((acc, v) => acc + v.issue_count, 0) || 0;

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">Volunteer Activity</h1>
                        <button 
                            onClick={() => router.push('/dashboard')} 
                            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Back to Check-in
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
                            <p className="text-gray-500 text-sm font-medium uppercase">Total Check-Ins</p>
                            <p className="text-3xl font-bold text-purple-600">{totalCheckins}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
                            <p className="text-gray-500 text-sm font-medium uppercase">Total Issues Reported</p>
                            <p className="text-3xl font-bold text-red-600">{totalIssues}</p>
                        </div>
                    </div>
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Volunteer</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase">Check-Ins</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase">Issues Reported</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.map((v) => (
                                    <tr key={v.volunteer_id}>
                                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm font-medium">{v.full_name}</td>
                                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center font-bold text-purple-600">{v.checkin_count}</td>
                                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center font-bold text-red-600">{v.issue_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
