import React from "react";

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">404 - Page Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400">
          The page you are looking for does not exist.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
