import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Header onMenuToggle={toggleSidebar} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <main className="flex-1 pt-16 lg:ml-64">
          <div className="min-h-[calc(100vh-4rem)]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
