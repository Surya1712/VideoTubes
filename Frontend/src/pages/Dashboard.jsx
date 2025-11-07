import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Video,
  BarChart2,
  ListVideo,
  Upload,
  Eye,
  EyeOff,
  Film,
} from "lucide-react";
import videoService from "../services/video.service";
import { formatTimeAgo, formatViews } from "../utils/formatTime";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchUserVideos();
  }, [user]);

  const fetchUserVideos = async () => {
    try {
      setLoading(true);
      const userVideos = await videoService.getUserVideos();
      setVideos(userVideos || []);
    } catch (error) {
      console.error("Error fetching dashboard videos: ", error);
    } finally {
      setLoading(false);
    }
  };

  const totalVideos = videos.length;
  const publishedVideos = videos.filter((v) => v.isPublished).length;
  const draftVideos = totalVideos - publishedVideos;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Create Dashboard</h1>
      <p className="text-gray-500 mb-8">
        Welcome back, {username.toLocaleUpperCase()}! Manage your channel here.
      </p>
      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link
          to="/upload"
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all border dark:border-gray-700 flex flex-col items-center text-center"
        >
          <Upload className="w-10 h-10 mb-3 text-blue-600" />
          <h3 className="text-lg font-semibold">Upload Video</h3>
          <p className="text-gray-500 text-sm mt-2">
            Share something new with your audience.
          </p>
        </Link>
        <Link
          to="/manage-videos"
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all border dark:border-gray-700 flex flex-col items-center text-center"
        >
          <Video className="w-10 h-10 mb-3 text-purple-600" />
          <h3 className="text-lg font-semibold">Manage Videos</h3>
          <p className="text-gray-500 text-sm mt-2">
            Edit, delete, or view your uploaded content.
          </p>
        </Link>

        <Link
          to="/analytics"
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all border dark:border-gray-700 flex flex-col items-center text-center"
        >
          <BarChart2 className="w-10 h-10 mb-3 text-green-600" />
          <h3 className="text-lg font-semibold">Analytics</h3>
          <p className="text-gray-500 text-sm mt-2">
            See views, likes, and engagement performance.
          </p>
        </Link>

        <Link
          to="/playlists"
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all border dark:border-gray-700 flex flex-col items-center text-center"
        >
          <ListVideo className="w-10 h-10 mb-3 text-pink-600" />
          <h3 className="text-lg font-semibold">Playlists</h3>
          <p className="text-gray-500 text-sm mt-2">
            Organize your videos into playlists.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
