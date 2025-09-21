import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ThumbsUp,
  ThumbsDown,
  Share,
  Download,
  MoreHorizontal,
  User,
  Bell,
} from "lucide-react";
import videoService from "../services/video.service.js";
import { commentService } from "../services/comment.service.js";
import { subscriptionService } from "../services/subscription.service.js";
import VideoPlayer from "../components/video/VideoPlayer.jsx";
import { formatViews, formatTimeAgo } from "../utils/formatTime.js";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const Watch = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVideo();
      fetchComments();
    }
  }, [id]);

  const fetchVideo = async () => {
    try {
      if (!id) return;

      console.log("Fetching video:", id);
      const videoData = await videoService.getVideoById(id);
      console.log("Fetched video data:", videoData);

      setVideo(videoData);
      setIsSubscribed(videoData.owner?.isSubscribed || false);
    } catch (error) {
      console.error("Error fetching video:", error);
      toast.error(error.message || "Failed to load video");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      if (!id) return;

      console.log("Fetching comments for video:", id);
      const commentsData = await commentService.getVideoComments(id);
      console.log("Fetched comments:", commentsData);

      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (error) {
      console.error("Failed to load comments:", error);
      // Don't show error toast for comments as it's not critical
    }
  };

  const handleLike = async () => {
    if (!user || !video) {
      toast.error("Please sign in to like videos");
      return;
    }

    try {
      setLiking(true);
      console.log("Toggling like for video:", video._id);

      await videoService.likeVideo(video._id);

      // Toggle the like state and update count
      setVideo((prev) => {
        if (!prev) return null;

        const newLiked = !prev.isLiked;
        const likeChange = newLiked ? 1 : -1;

        return {
          ...prev,
          isLiked: newLiked,
          likes: (prev.likes || 0) + likeChange,
        };
      });

      toast.success(video.isLiked ? "Like removed" : "Video liked!");
    } catch (error) {
      console.error("Error liking video:", error);
      toast.error(error.message || "Failed to like video");
    } finally {
      setLiking(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user || !video) {
      toast.error("Please sign in to subscribe");
      return;
    }

    try {
      console.log("Toggling subscription for channel:", video.owner._id);
      await subscriptionService.toggleSubscription(video.owner._id);

      const newSubscribed = !isSubscribed;
      setIsSubscribed(newSubscribed);

      // Update subscriber count in video owner data
      setVideo((prev) => {
        if (!prev) return null;

        const subscriberChange = newSubscribed ? 1 : -1;
        return {
          ...prev,
          owner: {
            ...prev.owner,
            subscribersCount:
              (prev.owner.subscribersCount || 0) + subscriberChange,
          },
        };
      });

      toast.success(newSubscribed ? "Subscribed!" : "Unsubscribed!");
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error(error.message || "Failed to update subscription");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user || !video || !newComment.trim()) return;

    try {
      setCommenting(true);
      console.log("Adding comment to video:", video._id);

      const comment = await commentService.addComment(
        video._id,
        newComment.trim()
      );
      console.log("Comment added:", comment);

      // Add new comment to the beginning of the list
      setComments((prev) => [comment, ...prev]);
      setNewComment("");
      toast.success("Comment posted!");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error(error.message || "Failed to post comment");
    } finally {
      setCommenting(false);
    }
  };

  // Helper function to get image/video URL
  const getMediaUrl = (mediaField) => {
    if (typeof mediaField === "string") {
      return mediaField;
    }
    return mediaField?.url || mediaField;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-lg mb-4"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Video Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The video you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Video Player */}
          <VideoPlayer
            src={getMediaUrl(video.videoFile)}
            poster={getMediaUrl(video.thumbnail)}
          />

          <div className="mt-4">
            {/* Video Title */}
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {video.title}
            </h1>

            {/* Video Stats and Actions */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span>{formatViews(video.views || 0)} views</span>
                <span className="mx-1">•</span>
                <span>{formatTimeAgo(video.createdAt)}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLike}
                  disabled={liking || !user}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-full border transition-colors disabled:opacity-50 ${
                    video.isLiked
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
                      : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{video.likes || 0}</span>
                </button>

                <button className="flex items-center space-x-1 px-4 py-2 rounded-full border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <ThumbsDown className="w-4 h-4" />
                  <span>{video.dislikes || 0}</span>
                </button>

                <button className="flex items-center space-x-1 px-4 py-2 rounded-full border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </button>

                <button className="p-2 rounded-full border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Channel Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
              <div className="flex items-center space-x-3">
                <Link to={`/channel/${video.owner.username}`}>
                  {video.owner.avatar ? (
                    <img
                      src={getMediaUrl(video.owner.avatar)}
                      alt={video.owner.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center ${
                      video.owner.avatar ? "hidden" : "flex"
                    }`}
                  >
                    <User className="w-5 h-5 text-white" />
                  </div>
                </Link>
                <div>
                  <Link
                    to={`/channel/${video.owner.username}`}
                    className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 block"
                  >
                    {video.owner.fullName}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatViews(video.owner.subscribersCount || 0)} subscribers
                  </p>
                </div>
              </div>

              {user && user._id !== video.owner._id && (
                <button
                  onClick={handleSubscribe}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                    isSubscribed
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  <Bell
                    className={`w-4 h-4 ${isSubscribed ? "fill-current" : ""}`}
                  />
                  <span>{isSubscribed ? "Subscribed" : "Subscribe"}</span>
                </button>
              )}
            </div>

            {/* Video Description */}
            {video.description && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-8">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {video.description}
                </p>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Comments ({comments.length})
            </h3>

            {/* Add Comment Form */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="flex space-x-3">
                  {user.avatar ? (
                    <img
                      src={getMediaUrl(user.avatar)}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 ${
                      user.avatar ? "hidden" : "flex"
                    }`}
                  >
                    <User className="w-4 h-4 text-white" />
                  </div>

                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-none"
                      rows={3}
                      maxLength={1000}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {newComment.length}/1000
                      </span>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setNewComment("")}
                          disabled={!newComment.trim()}
                          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newComment.trim() || commenting}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {commenting ? "Posting..." : "Comment"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  <Link
                    to="/login"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Sign in
                  </Link>{" "}
                  to leave a comment
                </p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-3">
                    {comment.owner?.avatar ? (
                      <img
                        src={getMediaUrl(comment.owner.avatar)}
                        alt={comment.owner.fullName}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 ${
                        comment.owner?.avatar ? "hidden" : "flex"
                      }`}
                    >
                      <User className="w-4 h-4 text-white" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {comment.owner?.fullName || "Anonymous User"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-white text-sm">
                        {comment.content}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <button className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{comment.likes || 0}</span>
                        </button>
                        <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Up next
            </h3>
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              Related videos will appear here
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;
