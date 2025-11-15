import useSWR from 'swr';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';

const fetcher = (url, token) => 
  fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json());

export default function AdminLogs() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !user.is_admin) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const { data: logs } = useSWR(
    (user?.is_admin) ? ['/api/admin/logs', user.token] : null,
    ([url, token]) => fetcher(url, token)
  );

  if (loading || !user || !user.is_admin) return <p className="p-10">Verifying...</p>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Issue Logs (Admin)</h1>
            <button 
              onClick={() => router.push('/dashboard')} 
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to Check-in
            </button>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student Ref</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reported By</th>
                </tr>
              </thead>
              <tbody>
                {logs?.map((log) => (
                  <tr key={log.log_id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {new Date(log.report_time).toLocaleString()}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <span className="relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight">
                        <span aria-hidden className="absolute inset-0 bg-red-200 opacity-50 rounded-full"></span>
                        <span className="relative">{log.issue_type}</span>
                      </span>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-gray-500">
                        {log.issue_details}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        {log.student_reference}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm font-medium">
                        {log.reporter_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!logs || logs.length === 0) && (
                <p className="p-5 text-center text-gray-500">No issues reported yet.</p>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}