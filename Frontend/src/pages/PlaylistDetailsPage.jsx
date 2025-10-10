import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { interactionService } from "../services/interaction.service.js";
// import videoService from "../services/video.service.js";
import VideoGrid from "../components/video/VideoGrid.jsx";
import { toast } from "react-hot-toast";

const PlaylistDetailsPage = () => {
  const { playlistId } = useParams(); // Get the ID from the URL
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      if (!playlistId) return;

      setLoading(true);
      try {
        // Use the existing service method to fetch playlist details
        const res = await interactionService.getPlaylistById(playlistId);

        // Assuming the backend returns the full playlist object with a 'videos' array
        const fetchedPlaylist = res.data?.data || res.data || res;

        setPlaylist(fetchedPlaylist);
        const unpopulatedVideos = fetchedPlaylist.videos || [];
        const videoPromises = unpopulatedVideos.map(async (video) => {
          const videoId = video._id || video;
          if (videoId) {
            try {
              const fullVideoRes = await interactionService.getVideo(videoId);
              //Safely extract the video object from the response
              // Assuming the video is nested in a 'data' property
              const fullVideo = fullVideoRes.data?.data || fullVideoRes.data;
              if (fullVideo && fullVideo._id) {
                return fullVideo;
              }
            } catch (error) {
              console.error(
                `Error fetching details for video ${videoId}:`,
                error
              );
              return {
                ...video,
                title: "Video Failed to Load",
                owner: { username: "Error" },
              };
            }
          }
          return null;
        });
        // Wait for all video fetches to complete
        const enrichedVideos = (await Promise.all(videoPromises)).filter(
          (v) => v !== null
        );
        setVideos(enrichedVideos);
      } catch (error) {
        console.error("Failed to fetch playlist details:", error);
        toast.error("Failed to load playlist.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistDetails();
  }, [playlistId]);

  if (loading) {
    return (
      <div className="p-6 text-center dark:text-gray-400">
        Loading playlist...
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="p-6 text-center dark:text-gray-400">
        Playlist not found or could not be loaded.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-2 dark:text-white">
        {playlist.name}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {playlist.description || "No description provided."}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {videos.length} videos • Last updated:{" "}
        {new Date(playlist.updatedAt).toLocaleDateString()}
      </p>

      <hr className="mb-6 border-gray-200 dark:border-gray-700" />

      {videos.length > 0 ? (
        <VideoGrid videos={videos} /> // Reuse your existing VideoGrid component
      ) : (
        <div className="text-center py-10 dark:text-gray-400">
          This playlist currently has no videos.
        </div>
      )}
    </div>
  );
};

export default PlaylistDetailsPage;
