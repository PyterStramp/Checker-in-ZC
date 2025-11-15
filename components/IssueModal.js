import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function IssueModal({ isOpen, onClose, attendee }) {
  const { user } = useAuth();
  const [issueType, setIssueType] = useState("Missing ID");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !attendee) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issue_type: issueType,
          issue_details: details,
          student_reference: `ID: ${attendee.uni_id} | Name: ${attendee.full_name}`,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed issue");
      }

      alert("Issue reported successfully!");
      onClose();
      setDetails("");
    } catch (error) {
      console.error("Reporting error:", error);
      alert(`Error reporting issue: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h3 className="text-xl font-bold mb-4 border-b pb-2 text-red-600">
          Report Issue for {attendee.full_name}
        </h3>

        <form onSubmit={handleSubmit}>
          <p className="text-sm text-gray-600 mb-4">
            Ref: {attendee.uni_id} from {attendee.uni_name}
          </p>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Issue Type
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="Missing ID">Missing ID/Credentials</option>
              <option value="Double Registration">Double Registration</option>
              <option value="Other">Other (Specify in details)</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Details
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Briefly describe the problem encountered."
              className="w-full p-2 border rounded h-24 resize-none"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded ${
                isSubmitting ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isSubmitting ? "Logging..." : "Log Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
