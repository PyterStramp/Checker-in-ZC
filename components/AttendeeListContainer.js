import useSWR from "swr";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import SearchBar from './SearchBar';
import AttendeeItem from './AttendeeItem';

//fetcher
const fetcher = (url, token) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((res) => {
    if (!res.ok) throw new Error("Authentication failed");
    return res.json();
  });

export default function AttendeeListContainer({ onReportIssue }) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  //fetching with swr

  const {
    data: attendeesData,
    error,
    isLoading,
  } = useSWR(
    [`/api/attendees?q=${searchTerm}`, user?.token],
    ([url, token]) => fetcher(url, token),
    {
      refreshInterval: 5000,
    }
  );

  if (error)
    return (
      <div className="text-red-600 p-4">
        Error loading attendees: {error.message}
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {isLoading ? (
        <p className="text-center py-8">Loading attendee list...</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {attendeesData?.map((attendee) => (
            <AttendeeItem key={attendee.attendee_id} attendee={attendee} onReportIssue={onReportIssue} />
          ))}

          {attendeesData?.length === 0 && searchTerm && (
            <p className="text-center text-gray-500 py-6 sm:py-8">
              No results found for `{searchTerm}`.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
