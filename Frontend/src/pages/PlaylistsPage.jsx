import React from "react";
import PlaylistMenu from "../components/PlaylistMenu.jsx";

export default function PlaylistsPage() {
  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">
        Your Playlists
      </h1>
      <PlaylistMenu />
    </div>
  );
}
