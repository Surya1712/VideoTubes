import React from "react";

const ProgressTracker = ({
  progress = 0,
  speed = 0,
  eta = null,
  label = "Uploading...",
}) => {
  return (
    <div className="space-y-2 mt-4">
      {/* Label */}
      <div className="flex justify-between items-center text-sm font-medium text-gray-700 dark:text-gray-300">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-3 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* speed and ETA info */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>Speed: {speed ? `${speed} MB/s` : "Calculating.."}</span>
        <span>
          ETA:{" "}
          {eta ? `${eta}s remaining` : progress > 0 ? "Estimating..." : "--"}
        </span>
      </div>
    </div>
  );
};

export default ProgressTracker;
