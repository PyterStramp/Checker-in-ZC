//the component acts like a gatekeeper, rendering content only if the user is logged in, if not, IT should kick

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  const router = useRouter();

  useEffect(() => {
    //redirect if the loading is done and there's no user
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  //showing something just in case

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-purple-600 font-semibold">Loading access...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
};

export default ProtectedRoute;