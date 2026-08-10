// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-sm">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 text-sm">
            You don't have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;