import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, X, Play, Image, Flashlight } from "lucide-react";
import videoService from "../services/video.service";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import ProgressTracker from "../components/upload/ProgressTracker";

const Upload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublished: false,
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  // Progress tracking states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Cleanup object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [videoPreview, thumbnailPreview]);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File size validation (100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video file size must be less than 100MB");
      return;
    }

    // File type validation
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file");
      return;
    }

    // Clean up previous preview
    if (videoPreview) URL.revokeObjectURL(videoPreview);

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));

    // Auto-generate title from filename if empty
    if (!formData.title.trim()) {
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setFormData((prev) => ({ ...prev, title: fileName }));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File size validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Thumbnail size must be less than 5MB");
      return;
    }

    // File type validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Clean up previous preview
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);

    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview("");

    // Reset the file input
    const videoInput = document.querySelector(
      'input[type="file"][accept="video/*"]'
    );
    if (videoInput) videoInput.value = "";
  };

  const removeThumbnail = () => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnail(null);
    setThumbnailPreview("");

    // Reset the file input
    const thumbnailInput = document.querySelector(
      'input[type="file"][accept="image/*"]'
    );
    if (thumbnailInput) thumbnailInput.value = "";
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!videoFile) return toast.error("Please select a video file");
    if (!thumbnail) return toast.error("Please select a thumbnail");
    if (!formData.title.trim()) return toast.error("Please enter a title");

    const uploadData = new FormData();
    uploadData.append("videoFile", videoFile);
    uploadData.append("thumbnail", thumbnail);
    uploadData.append("title", formData.title.trim());
    uploadData.append("description", formData.description.trim());
    uploadData.append("isPublished", formData.isPublished);

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadSpeed(0);
      setTimeRemaining(null);
      setIsProcessing(false);

      let startTime = Date.now();
      let lastLoaded = 0;

      const response = await videoService.uploadVideo(
        uploadData,
        (percent, progressEvent) => {
          const currentTime = Date.now();
          const timeElapsed = (currentTime - startTime) / 1000; // seconds
          const loadedBytes = progressEvent.loaded;
          const totalBytes = progressEvent.total || videoFile.size;

          // Calculate upload speed (MB/s)
          const bytesSinceLast = loadedBytes - lastLoaded;
          const speedMBps =
            bytesSinceLast / 1024 / 1024 / (timeElapsed > 0 ? timeElapsed : 1);
          setUploadSpeed(speedMBps.toFixed(2));

          // Calculate ETA
          const remainingBytes = totalBytes - loadedBytes;
          const estimatedSeconds =
            speedMBps > 0 ? remainingBytes / (speedMBps * 1024 * 1024) : 0;
          setTimeRemaining(estimatedSeconds.toFixed(0));

          // Update progress bar
          const percentCompleted = Math.round((loadedBytes * 100) / totalBytes);
          setUploadProgress(percentCompleted);

          // when upload reaches 100%, switch to processing state
          if (percentCompleted >= 100) {
            setIsProcessing(true);
          }

          lastLoaded = loadedBytes;
          startTime = currentTime;
        }
      );

      // wait until backend finishing processing(cloudinary, upload, DB save)
      setIsProcessing(false);

      toast.success("✅ Video uploaded successfully!");
      if (response && response._id) navigate(`/watch/${response._id}`);
      else navigate("/");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadSpeed(0);
      setTimeRemaining(null);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">
        Upload Video
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video File Section */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 rounded-lg hover:border-blue-500 transition-colors">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
            Video File
          </h2>

          {!videoFile ? (
            <label className="cursor-pointer flex flex-col items-center justify-center py-8">
              <UploadIcon className="w-12 h-12 mb-4 text-gray-400" />
              <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
                Select Video File
              </span>
              <span className="text-sm text-gray-500 mt-2">
                Maximum file size: 100MB
              </span>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="flex items-center space-x-3">
                  <Play className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {videoFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeVideo}
                  className="text-red-500 hover:text-red-700"
                  disabled={uploading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {videoPreview && (
                <video
                  src={videoPreview}
                  controls
                  className="w-full max-h-64 rounded"
                />
              )}
            </div>
          )}
        </div>

        {/* Thumbnail Section */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 rounded-lg hover:border-blue-500 transition-colors">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
            Thumbnail
          </h2>

          {!thumbnail ? (
            <label className="cursor-pointer flex flex-col items-center justify-center py-8">
              <Image className="w-12 h-12 mb-4 text-gray-400" />
              <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
                Select Thumbnail
              </span>
              <span className="text-sm text-gray-500 mt-2">
                Maximum file size: 5MB
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {thumbnail.name}
                </span>
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="text-red-500 hover:text-red-700"
                  disabled={uploading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {thumbnailPreview && (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-48 h-28 object-cover rounded border"
                />
              )}
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div>
            <ProgressTracker
              progress={uploadProgress}
              speed={uploadSpeed}
              eta={timeRemaining}
              label={
                isProcessing
                  ? "Finalizing upload...(Processing on server)"
                  : "Uploading your video..."
              }
            />
            {isProcessing && (
              <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>
                  Video uploaded. Waiting for server to finish
                  processing(Cloudinary)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Video Details Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Video Details
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              placeholder="Enter video title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
              disabled={uploading}
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              placeholder="Enter video description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
              rows={4}
              disabled={uploading}
              maxLength={1000}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="publish"
              checked={formData.isPublished}
              onChange={(e) =>
                handleInputChange("isPublished", e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={uploading}
            />
            <label
              htmlFor="publish"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Publish immediately
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              uploading || !videoFile || !thumbnail || !formData.title.trim()
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {uploading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>
              {uploading ? `Uploading... ${uploadProgress}%` : "Upload Video"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Upload;
