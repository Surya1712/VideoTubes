import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Menu,
  Bell,
  Plus,
  Video,
  User,
  Moon,
  Sun,
  LogOut,
  Settings,
  History,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Menu as HeadlessMenu } from "@headlessui/react";
import CreateButton from "../common/CreateButton.jsx";
import VideoUploadModal from "../video/videoUploadModel.jsx";

const Header = ({ onMenuToggle }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showModel, setShowModel] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold hidden sm:inline">
              VideoTube
            </span>
          </Link>
        </div>

        {/* Center section - Search */}
        <div className="flex-1 max-w-2xl mx-4">
          <form onSubmit={handleSearch} className="flex">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-full bg-white dark:bg-gray-800 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {user ? (
            <>
              <CreateButton />
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Bell className="w-5 h-5" />
              </button>

              <HeadlessMenu as="div" className="relative">
                <HeadlessMenu.Button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </HeadlessMenu.Button>

                <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 focus:outline-none">
                  <div className="p-2">
                    <HeadlessMenu.Item>
                      {({ active }) => (
                        <Link
                          to={`/channel/${user.username}`}
                          className={`flex items-center space-x-2 px-3 py-2 rounded text-sm ${
                            active ? "bg-gray-100 dark:bg-gray-700" : ""
                          }`}
                        >
                          <User className="w-4 h-4" />
                          <span>Your Channel</span>
                        </Link>
                      )}
                    </HeadlessMenu.Item>

                    <HeadlessMenu.Item>
                      {({ active }) => (
                        <Link
                          to="/change-password"
                          className={`flex items-center space-x-2 px-3 py-2 rounded text-sm ${
                            active ? "bg-gray-100 dark:bg-gray-700" : ""
                          }`}
                        >
                          <History className="w-4 h-4" />
                          <span>Change Password</span>
                        </Link>
                      )}
                    </HeadlessMenu.Item>

                    <HeadlessMenu.Item>
                      {({ active }) => (
                        <Link
                          to="/settings"
                          className={`flex items-center space-x-2 px-3 py-2 rounded text-sm ${
                            active ? "bg-gray-100 dark:bg-gray-700" : ""
                          }`}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                      )}
                    </HeadlessMenu.Item>

                    <hr className="my-2 border-gray-200 dark:border-gray-600" />

                    <HeadlessMenu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={`flex items-center space-x-2 px-3 py-2 rounded text-sm w-full text-left ${
                            active ? "bg-gray-100 dark:bg-gray-700" : ""
                          }`}
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      )}
                    </HeadlessMenu.Item>
                  </div>
                </HeadlessMenu.Items>
              </HeadlessMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
