import React, { useState } from "react";
// import { User, Lock } from "lucide-react"; // Removed icon import

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt:", { username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-700">
      <div className="bg-blue-700 p-8 rounded w-full max-w-sm">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          TaskFlow
        </h1>
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
          <button
            type="submit"
            className="w-full bg-white text-blue-700 font-semibold py-2 px-4 rounded hover:bg-gray-200 transition duration-200"
          >
            LOGIN
          </button>
          <div className="text-center">
            <a href="#" className="text-sm text-gray-300 hover:text-white">
              Forgot password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
