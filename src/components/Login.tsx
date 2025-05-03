import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import { User, Lock } from "lucide-react"; // Removed icon import

const API_URL = "https://task-paz7d.ondigitalocean.app"; // Base URL for API

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Call the signin API
      const response = await axios.post(`${API_URL}/auth/signin`, {
        email,
        password,
      });

      const { accessToken } = response.data;

      // Store the token (e.g., in localStorage)
      localStorage.setItem("accessToken", accessToken);

      // Optionally, fetch user data after login
      try {
        const meResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log("User data:", meResponse.data);
        // Store user data if needed (e.g., in state management)
      } catch (meError) {
        console.error("Failed to fetch user data:", meError);
        // Handle error fetching user data (e.g., show a notification)
        // Decide if login should still proceed or token should be cleared
      }

      // Redirect to dashboard or main app page
      navigate("/dashboard"); // Assuming a dashboard route exists
    } catch (err: any) {
      console.error("Login failed:", err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || "Invalid email or password");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-700">
      <div className="bg-blue-700 p-8 rounded w-full max-w-sm">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          TaskFlow
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="email"
              placeholder="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-blue-700 border border-gray-300 rounded text-white placeholder-gray-300 focus:outline-none focus:border-white"
            />
          </div>
          <div className="relative">
            {/* <Lock
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            /> */}
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-blue-700 border border-gray-300 rounded text-white placeholder-gray-300 focus:outline-none focus:border-white"
            />
          </div>
          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-blue-700 font-semibold py-2 px-4 rounded hover:bg-gray-200 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "LOGIN"}
          </button>
          <div className="text-center">
            <a href="#" className="text-sm text-gray-300 hover:text-white">
              Forgot password?
            </a>
            <p className="mt-2">
              <span className="text-gray-300 text-sm">
                Don't have an account?{" "}
              </span>
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-sm text-white hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
