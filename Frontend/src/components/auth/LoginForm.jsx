// components/auth/LoginForm.jsx
import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { validateEmail } from "../../utils/validation.js";
import { authService } from "../../services/auth.service.js";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");

  const { login, user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setApiMessage("");

    try {
      // Use only AuthContext login (keeps global state in sync)
      const testLogin = await login(formData.email, formData.password);
      setApiMessage("✅ Login successful! Redirecting...");
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        general: error.message || "Login failed. Please try again.",
      });
      setApiMessage("❌ Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // const handleTestAPI = async () => {
  //   setApiMessage("Testing API connection...");
  //   try {
  //     const response = await authService.testAPI();
  //     setApiMessage(`✅ API Test successful: ${response.message}`);
  //   } catch (error) {
  //     console.error("API test failed:", error);
  //     setApiMessage(
  //       `❌ API Test failed: ${error.message || "Connection error"}`
  //     );
  //   }
  // };

  // const handleTestLogin = async () => {
  //   setApiMessage("Testing login API...");
  //   try {
  //     await login("test@example.com", "password123");
  //     setApiMessage("✅ Test Login successful! Redirecting...");
  //   } catch (error) {
  //     console.error("Login test failed:", error);
  //     setApiMessage(
  //       `❌ Test Login failed: ${error.message || "Authentication error"}`
  //     );
  //   }
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sign in to VideoTube
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* API Response Message */}
        {apiMessage && (
          <div
            className={`p-3 rounded-md text-sm ${
              apiMessage.includes("✅")
                ? "bg-green-50 text-green-700 border border-green-200"
                : apiMessage.includes("❌")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {apiMessage}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* General error message */}
          {errors.general && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {/* Test buttons for debugging */}
          {/* <div className="mt-4 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Development Tools
            </p>
            <button
              type="button"
              onClick={handleTestAPI}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm transition-colors"
            >
              Test API Connection
            </button>
            <button
              type="button"
              onClick={handleTestLogin}
              className="w-full py-2 px-4 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm transition-colors"
            >
              Test Login API
            </button> */}
          {/* </div> */}
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
