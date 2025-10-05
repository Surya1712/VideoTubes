import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Eye, EyeOff, Upload, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "../../utils/validation.js";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });

  const [files, setFiles] = useState({
    avatar: null,
    coverImage: null,
  });

  const [previews, setPreviews] = useState({
    avatar: null,
    coverImage: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register, user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        [fileType]: "Please select a valid image file",
      }));
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [fileType]: "File size must be less than 5MB",
      }));
      return;
    }

    setFiles((prev) => ({ ...prev, [fileType]: file }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviews((prev) => ({ ...prev, [fileType]: e.target.result }));
    };
    reader.readAsDataURL(file);

    // Clear any previous errors for this field
    setErrors((prev) => ({ ...prev, [fileType]: "" }));
  };

  const removeFile = (fileType) => {
    setFiles((prev) => ({ ...prev, [fileType]: null }));
    setPreviews((prev) => ({ ...prev, [fileType]: null }));

    // Reset file input
    const input = document.getElementById(fileType);
    if (input) input.value = "";
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = "Username is required";
    } else {
      const usernameErrors = validateUsername(formData.username);
      if (usernameErrors.length > 0) newErrors.username = usernameErrors[0];
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Full name validation
    if (!formData.fullName) {
      newErrors.fullName = "Full name is required";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) newErrors.password = passwordErrors[0];
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Avatar is required according to your backend
    if (!files.avatar) {
      newErrors.avatar = "Avatar image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // clear server error before submitting
    setErrors((prev) => ({ ...prev, server: "" }));
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("password", formData.password);

      // attach avatar file
      if (files.avatar) {
        formDataToSend.append("avatar", files.avatar);
      }
      if (files.coverImage) {
        // Use the backend-expected key "coverImage"
        formDataToSend.append("coverImage", files.coverImage);
      }

      // DEBUG: log FormData entries (keys and file info) to help troubleshoot server error
      for (const entry of formDataToSend.entries()) {
        const [key, value] = entry;
        if (value instanceof File) {
          console.log("FormData:", key, value.name, value.type, value.size);
        } else {
          console.log("FormData:", key, value);
        }
      }

      // Call auth context register
      await register(formDataToSend);

      // Reset form
      setFormData({
        username: "",
        email: "",
        fullName: "",
        password: "",
        confirmPassword: "",
      });
      setFiles({ avatar: null, coverImage: null });
      setPreviews({ avatar: null, coverImage: null });
    } catch (error) {
      const serverMessage =
        error.message || "An unexpected registration error occurred.";
      console.error("Registration error:", serverMessage, error);

      // Set the extracted message as the server error
      setErrors((prev) => ({ ...prev, server: serverMessage }));
    } finally {
      setLoading(false);
    }
  };

  const FileUploadField = ({
    id,
    label,
    required = false,
    preview,
    error,
    onFileChange,
    onRemove,
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt={`${label} preview`}
            className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <label
            htmlFor={id}
            className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Click to upload {label.toLowerCase()}
            <input
              id={id}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Basic Information
              </h3>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Choose a username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.username}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Create a password"
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

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Right column: Profile Images */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Profile Images
              </h3>

              {/* ✅ CORRECT AVATAR FIELD */}
              <FileUploadField
                id="avatar"
                label="Avatar"
                required={true} // Must be required as per user.controller.js
                preview={previews.avatar}
                error={errors.avatar}
                onFileChange={(e) => handleFileChange(e, "avatar")} // Use the correct handler
                onRemove={() => removeFile("avatar")}
              />
              {/* ------------------------- */}
              <FileUploadField
                id="coverImage"
                label="Cover Image"
                required={false}
                preview={previews.coverImage}
                error={errors.coverImage}
                onFileChange={(e) => handleFileChange(e, "coverImage")}
                onRemove={() => removeFile("coverImage")}
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            {errors.server && (
              <p className="mb-4 text-sm text-red-600 dark:text-red-400">
                {errors.server}
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <p>
            By creating an account, you agree to our Terms of Service and
            Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
//           <p>
//             By creating an account, you agree to our Terms of Service and
//             Privacy Policy.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegisterForm;
