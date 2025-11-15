import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function CreateVolunteer() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    is_admin: false,
  });
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && !user.is_admin) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", msg: "" });

    try {
      const res = await fetch("/api/admin/create_volunteer", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create user");
      }

      setStatus({
        type: "success",
        msg: `Volunteer "${formData.full_name}" created!`,
      });
      setFormData({ ...formData, username: "", password: "", full_name: "" });
    } catch (error) {
      setStatus({ type: "error", msg: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user?.is_admin) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
        <div className="w-full max-w-md">
          <button
            onClick={() => router.back()}
            className="mb-4 text-gray-600 hover:text-gray-900 text-sm font-semibold"
          >
            Back to Dashboard
          </button>

          <div className="bg-white shadow-md rounded-lg p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Create New Volunteer
            </h1>

            {status.msg && (
              <div
                className={`mb-4 p-3 rounded text-sm ${
                  status.type === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {status.msg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Full Name
                </label>
                <input
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Username
                </label>
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-purple-500"
                  required
                  minLength={5}
                />
              </div>

              <div className="mb-6 flex items-center">
                <input
                  id="is_admin"
                  name="is_admin"
                  type="checkbox"
                  checked={formData.is_admin}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_admin"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Grant Admin Privileges?
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-white ${
                  isSubmitting ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {isSubmitting ? "Creating..." : "Create Volunteer"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}