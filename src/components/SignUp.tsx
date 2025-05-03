import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import { User, Lock, Mail } from "lucide-react"; // Removed icon import

const API_URL = "https://task-paz7d.ondigitalocean.app"; // Base URL for API

const SignUp: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic password validation (example)
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/auth/signup`, {
        name,
        email,
        password,
      });

      // On successful signup, redirect to login page
      navigate("/login");
    } catch (err: any) {
      console.error("Signup failed:", err);
      if (axios.isAxiosError(err) && err.response) {
        // Handle specific errors from backend if available
        if (Array.isArray(err.response.data.message)) {
          setError(err.response.data.message.join(", "));
        } else {
          setError(
            err.response.data.message ||
              "Failed to create account. Email might be taken."
          );
        }
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
          Create Account
        </h1>{" "}
        {/* Changed title */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            {/* <User
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            /> */}
            <input
              type="text"
              placeholder="NAME"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-blue-700 border border-gray-300 rounded text-white placeholder-gray-300 focus:outline-none focus:border-white" // Adjusted padding
            />
          </div>
          <div className="relative">
            {/* Added Email Field */}
            {/* <Mail
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            /> */}
            <input
              type="email"
              placeholder="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-blue-700 border border-gray-300 rounded text-white placeholder-gray-300 focus:outline-none focus:border-white" // Adjusted padding
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
              className="w-full px-3 py-2 bg-blue-700 border border-gray-300 rounded text-white placeholder-gray-300 focus:outline-none focus:border-white" // Adjusted padding
            />
          </div>
          {error && (
            <div className="text-red-400 text-sm text-center break-words">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-blue-700 font-semibold py-2 px-4 rounded hover:bg-gray-200 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "SIGN UP"}
          </button>
          <div className="text-center">
            {/* Changed link to button for navigation */}
            <span className="text-sm text-gray-300">
              Already have an account?{" "}
            </span>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm text-white hover:underline"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
