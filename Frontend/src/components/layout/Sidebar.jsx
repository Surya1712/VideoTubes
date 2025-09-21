import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  TrendingUp,
  Clock,
  ThumbsUp,
  PlaySquare,
  History,
  User,
  Settings,
  HelpCircle,
  Upload,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const mainLinks = [
    { icon: Home, label: "Home", path: "/" },
    { icon: TrendingUp, label: "Trending", path: "/trending" },
    { icon: PlaySquare, label: "Subscriptions", path: "/subscriptions" },
  ];

  const userLinks = user
    ? [
        {
          icon: User,
          label: "Your Channel",
          path: `/channel/${user.username}`,
        },
        { icon: History, label: "History", path: "/history" },
        { icon: PlaySquare, label: "Your Videos", path: "/manage-videos" },
        { icon: Clock, label: "Watch Later", path: "/watch-later" },
        { icon: ThumbsUp, label: "Liked Videos", path: "/liked-videos" },
      ]
    : [];

  const bottomLinks = [
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: HelpCircle, label: "Help", path: "/help" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
    fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 
    border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0 lg:fixed lg:z-40
  `}
      >
        <nav className="h-full overflow-y-auto py-4">
          {/* Main Navigation */}
          <div className="px-3 mb-4">
            {mainLinks.map(({ icon: Icon, label, path }) => (
              <Link
                key={path}
                to={path}
                onClick={onClose}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(path)
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Upload Section - Only show if user is logged in */}
          {user && (
            <>
              <hr className="border-gray-200 dark:border-gray-700 mx-3 mb-4" />

              <div className="px-3 mb-4">
                <Link
                  to="/upload"
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/upload")
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  <span className="font-semibold">Upload Video</span>
                </Link>
              </div>

              <hr className="border-gray-200 dark:border-gray-700 mx-3 mb-4" />

              {/* User Links */}
              <div className="px-3 mb-4">
                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Library
                </h3>
                {userLinks.map(({ icon: Icon, label, path }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={onClose}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(path)
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* If user is not logged in, still show other sections */}
          {!user && (
            <hr className="border-gray-200 dark:border-gray-700 mx-3 mb-4" />
          )}

          {/* Bottom Links */}
          <div className="px-3">
            {bottomLinks.map(({ icon: Icon, label, path }) => (
              <Link
                key={path}
                to={path}
                onClick={onClose}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(path)
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 pt-8 pb-4 text-xs text-gray-500 dark:text-gray-400">
            <p>&copy; 2024 VideoTube</p>
            <p className="mt-1">Built with React & Tailwind</p>
          </div>
        </nav>
      </aside>
    </>
  );
};
export default Sidebar;
