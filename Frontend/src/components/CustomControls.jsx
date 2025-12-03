import React from "react";

// Use a simple Play/Pause icon for this example (you can replace with a library like heroicons)
const PlayIcon = () => (
  <svg className="w-10 h-10 text-white fill-current" viewBox="0 0 24 24">
    <path d="M6 3l15 9-15 9z" />
  </svg>
);
const PauseIcon = () => (
  <svg className="w-10 h-10 text-white fill-current" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

export default function CustomControls({
  isPlaying,
  progress,
  togglePlay,
  handleSeek,
}) {
  // Convert progress fraction (0 to 1) to percentage string (0% to 100%)
  const progressPercent = `${progress * 100}%`;

  // Handler for the progress bar click/drag
  const handleProgressBarClick = (e) => {
    // Prevent click event from bubbling up to the player-wrapper (which toggles play)
    e.stopPropagation();

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newFraction = clickX / rect.width;

    handleSeek(newFraction);
  };

  return (
    <div
      // Tailwind CSS for the full overlay bar at the bottom
      className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 transition-opacity duration-300"
    >
      <div className="flex items-center space-x-4">
        {/* 1. Play/Pause Button */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Stop click from propagating to the player's wrapper
            togglePlay();
          }}
          className="p-1 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        {/* 2. Progress Bar (Clickable/Seekable) */}
        <div
          className="flex-grow h-2 bg-gray-600 rounded-full cursor-pointer overflow-hidden"
          onClick={handleProgressBarClick}
        >
          <div
            // The filled part of the progress bar
            className="h-full bg-red-600 rounded-full transition-all duration-100 ease-linear"
            style={{ width: progressPercent }}
          />
        </div>

        {/* 3. (Optional) Time Display / Other buttons can go here */}
        {/* You can add time display, volume control, and fullscreen buttons here. */}
        <span className="text-white text-sm font-mono">
          {/* Placeholder for real time: e.g., 0:00 / 12:34 */}
          {Math.round(progress * 100)}%
        </span>
      </div>
    </div>
  );
}
