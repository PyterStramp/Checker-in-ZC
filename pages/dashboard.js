import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import AttendeeListContainer from "../components/AttendeeListContainer";
import StatsDashboard from "../components/StatsDashboard";
import IssueModal from "../components/IssueModal";
import ExportModal from "../components/ExportModal";

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [currentAttendee, setCurrentAttendee] = useState(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const handleOpenModal = (attendee) => {
    setCurrentAttendee(attendee);
    setModalOpen(true);
  };

  return (
    // the protection is keeeey
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm p-4 border-b flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-800">Check-in</h1>
          {user?.is_admin && (
            <div className="flex items-center gap-3">
              <Link
                href="/admin/logs"
                className="text-sm font-bold text-purple-600 border border-purple-200 bg-purple-50 px-3 py-1 rounded hover:bg-purple-100 transition"
              >
                Logs
              </Link>
              <Link
                href="/admin/create-volunteer"
                className="text-sm font-bold text-green-600 border border-green-200 bg-green-50 px-3 py-1 rounded hover:bg-green-100 transition"
              >
                New User
              </Link>

              <Link
                href="/admin/volunteer-stats"
                className="text-sm font-bold text-gray-600 border border-gray-200 bg-gray-50 px-3 py-1 rounded hover:bg-gray-100 transition"
              >
                Leaderboard
              </Link>
            </div>
          )}
          <button
            onClick={logout}
            className="text-sm text-red-600 hover:text-red-800 font-medium border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition"
          >
            Logout
          </button>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <StatsDashboard />

          <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6 p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-semibold text-gray-700">
                Attendee Check-in List
              </h2>

              {user?.is_admin && (
                <button
                  onClick={() => setExportModalOpen(true)}
                  className="text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded hover:bg-blue-100"
                >
                  Export List
                </button>
              )}
            </div>

            <AttendeeListContainer onReportIssue={handleOpenModal} />
          </div>

          <IssueModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            attendee={currentAttendee}
          />

          <ExportModal
            isOpen={exportModalOpen}
            onClose={() => setExportModalOpen(false)}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
}
