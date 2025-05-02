import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");

  // Add logic here to fetch data using the token if needed
  // For now, just check if token exists

  React.useEffect(() => {
    if (!accessToken) {
      // Redirect to login if no token is found
      navigate("/login");
    }
    // Optionally: Fetch data using the token here
    // Example: Call /auth/me again or other protected endpoints
  }, [accessToken, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  if (!accessToken) {
    // Render nothing or a loading indicator while redirecting
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Welcome to TaskFlow Dashboard</h1>
      <p className="mb-6">You are logged in!</p>
      {/* Display user info here if fetched */}
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition duration-200"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
