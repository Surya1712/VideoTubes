import React, { useState, useEffect } from "react";
import { authService } from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await authService.changePassword(
        formData.oldPassword,
        formData.newPassword
      );
      setMessage("✅ Password changed successfully! Redirecting...");
      toast.success("Password updated successfully!");
      setRedirecting(true);
      setCountdown(3);
      setFormData({ oldPassword: "", newPassword: "" });
    } catch (error) {
      setMessage("❌" + (error.message || "Failed to change password"));
    } finally {
      setLoading(false);
    }
  };
  // Redirect after success
  useEffect(() => {
    if (redirecting) {
      const interval = setInterval(() => setCountdown((c) => c - 1), 1000);
      const timeout = setTimeout(() => {
        // redirect to dashboard or login based on user
        if (user?.username) {
          navigate(`/dashboard/${user.username}`);
        } else {
          navigate("/login");
        }
      }, 3000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [redirecting, navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
          Change Password
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Update your password to keep your account secure.
        </p>

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
              <div className="flex items-center gap-2 text-gray-500 text-xs">
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="oldPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Current Password
            </label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white
                         bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white
                         bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
