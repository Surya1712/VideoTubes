import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useFetcher } from "react-router-dom";
import { authService } from "../../services/auth.service";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await authService.resetPassword(token, password);
      setMessage("✅ Password reset successful! Redirecting to login...");
      setRedirecting(true);
      setCountdown(3);
    } catch (error) {
      setMessage("❌ " + (err.message || "Password reset failed"));
    } finally {
      setLoading(false);
    }
  };

  // countdown + redirect
  useEffect(() => {
    if (redirecting) {
      const interval = setInterval(() => setCountdown((c) => c - 1), 1000);
      const timeout = setTimeout(() => navigate("/login"), 3000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [redirecting, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter a new password to secure your account.
          </p>
        </div>

        {message && (
          <div
            className={`p-3 rounded-md text-sm flex justify-between items-center ${
              message.includes("✅")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <span>{message}</span>
            {redirecting && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg
                  className="animate-spin h-4 w-4 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <span>{countdown}s</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              New Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white
                         bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          {!redirecting && (
            <div className="text-center mt-4">
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 text-sm font-medium"
              >
                Back to Login
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
