import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { mutate } from "swr";

export default function AttendeeItem({ attendee, onReportIssue }) {
  const { user } = useAuth();

  const isArrived = attendee.status === "Arrived";
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      const res = await fetch(`/api/checkin/${attendee.attendee_id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed Check");
      }

      //updating UI
      mutate(
        (key) =>
          Array.isArray(key) &&
          typeof key[0] === "string" &&
          key[0].startsWith("/api/stats")
      );

      mutate(
        (key) =>
          Array.isArray(key) &&
          typeof key[0] === "string" &&
          key[0].startsWith("/api/attendees")
      );
    } catch (err) {
      console.error(err);
      alert(`Something went wrong: ${err.message}`);
    } finally {
      setIsCheckingIn(false);
    }
  };

  //a destructive action must be confirmed BEFORE doin this

  const handleRevoke = async () => {
    if (
      !window.confirm(
        `Are you sure you want to UNDO the check-in for ${attendee.full_name}?`
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/revoke/${attendee.attendee_id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) throw new Error("Revoke failed");

      // Refresh data immediately
      mutate(
        (key) =>
          Array.isArray(key) &&
          typeof key[0] === "string" &&
          key[0].startsWith("/api/stats")
      );

      mutate(
        (key) =>
          Array.isArray(key) &&
          typeof key[0] === "string" &&
          key[0].startsWith("/api/attendees")
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col sm:justify-between p-3 rounded-lg shadow-sm transition duration-150 ${
        isArrived
          ? "bg-green-100 border-l-4 border-green-500"
          : "bg-white border-l-4 border-gray-300"
      }`}
    >
      <div className="flex-1 min-w-0">
        <p
          className={`font-semibold text-lg sm:text-lg ${
            isArrived ? "text-green-800" : "text-gray-800"
          }`}
        >
          {attendee.full_name}
        </p>
        <p className="text-sm text-gray-500 truncate sm:whitespace-normal">
          ID: {attendee.uni_id} | University: {attendee.uni_name}
        </p>
      </div>
      {isArrived ? (
        <div className="mt-1.5 flex flex-col sm:flex-row sm:items-stretch gap-2">
          <span className="px-4 text-center text-green-600 font-bold text-sm">ARRIVED</span>
          <button
            onClick={handleRevoke}
            disabled={isLoading}
            className="px-4 text-red-500 hover:text-red-700 font-bold underline"
            title="Undo Check-in"
          >
            {isLoading ? "..." : "UNDO"}
          </button>
        </div>
      ) : (
        <div className="mt-1.5 flex flex-col sm:flex-row gap-2 w-auto">
          <button
            onClick={handleCheckIn}
            disabled={isCheckingIn}
            className={`px-3 py-1 sm:px-4 sm:py-2 text-sm font-bold text-white rounded transition duration-150 ${
              isCheckingIn
                ? "bg-purple-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {isCheckingIn ? "Processing..." : "CHECK IN"}
          </button>

          <button
            onClick={() => onReportIssue(attendee)}
            className="px-4 py-1 text-xs font-bold text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Report Issue
          </button>
        </div>
      )}
    </div>
  );
}
