import React, { useState } from "react";
// import { User, Lock, Mail } from "lucide-react"; // Removed icon import

const SignUp: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // Added email state
  const [password, setPassword] = useState("");
  // Add confirmPassword state if needed

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
    console.log("SignUp attempt:", { username, email, password });
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
              placeholder="USERNAME"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
          {/* Add Confirm Password field here if needed */}
          <button
            type="submit"
            className="w-full bg-white text-blue-700 font-semibold py-2 px-4 rounded hover:bg-gray-200 transition duration-200"
          >
            SIGN UP
          </button>
          <div className="text-center">
            {" "}
            {/* Link to Login */}
            <a href="#" className="text-sm text-gray-300 hover:text-white">
              Already have an account? Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
