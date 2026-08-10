// src/pages/Dashboard.jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-orange-600 mb-4">
          Dashboard
        </h1>

        {user ? (
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-medium">Name:</span> {user.name}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Role:</span> {user.role}
            </p>

            <button
              onClick={handleLogout}
              className="w-full mt-4 bg-gray-800 text-white py-2 rounded-md font-medium hover:bg-gray-900 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <p className="text-red-600">Not logged in</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;