import React, { useState } from "react";
import { X, Upload as UploadIcon, Play, Image } from "lucide-react";
import videoService from "../../services/video.service.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const VideoUploadModal = ({ isOpen, onClose, onSuccess, user }) => {
  const [step, setStep] = useState("upload");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublished: false,
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [isDraggingThumb, setIsDraggingThumb] = useState(false);

  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startswith("video/")) {
      // if (file.size > 100 * 1024 * 1024) {
      //   // 100MB limit
      //   toast.error("Video file size must be less than 100MB");
      //   return;
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    } else {
      toast.error("Please select a valid video file.");
    }
    // setVideoFile(file);
    // const url = URL.createObjectURL(file);
    // setVideoPreview(url);

    // // Auto-generate title from filename if empty
    // if (!formData.title) {
    //   const fileName = file.name.replace(/\.[^/.]+$/, "");
    //   setFormData((prev) => ({ ...prev, title: fileName }));
    // }
    // setStep("details");
    // }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startswith("image/")) {
      // if (file.size > 5 * 1024 * 1024) {
      //   // 5MB limit
      //   toast.error("Thumbnail size must be less than 5MB");
      //   return;
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      toast.error("Please select a valid image file.");
    }
    //   setThumbnail(file);
    //   const url = URL.createObjectURL(file);
    //   setThumbnailPreview(url);
    // }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!videoFile || !thumbnail) {
  //     toast.error("Please select both video and thumbnail files");
  //     return;
  //   }

  //   if (!formData.title.trim()) {
  //     toast.error("Please enter a video title");
  //     return;
  //   }

  //   setUploading(true);
  //   setUploadProgress(0);

  //   try {
  //     const uploadData = new FormData();
  //     uploadData.append("videoFile", videoFile);
  //     uploadData.append("thumbnail", thumbnail);
  //     uploadData.append("title", formData.title);
  //     uploadData.append("description", formData.description);
  //     uploadData.append("isPublished", formData.isPublished.toString());

  //     // Simulate upload progress
  //     const progressInterval = setInterval(() => {
  //       setUploadProgress((prev) => {
  //         if (prev >= 90) {
  //           clearInterval(progressInterval);
  //           return prev;
  //         }
  //         return prev + Math.random() * 10;
  //       });
  //     }, 500);

  //     const video = await videoService.uploadVideo(uploadData);

  //     clearInterval(progressInterval);
  //     setUploadProgress(100);

  //     toast.success("Video uploaded successfully!");
  //     onSuccess?.(video._id);
  //     onClose();
  //     resetForm();
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || "Upload failed");
  //   } finally {
  //     setUploading(false);
  //     setUploadProgress(0);
  //   }
  // };

  // const resetForm = () => {
  //   setStep("upload");
  //   setFormData({ title: "", description: "", isPublished: false });
  //   setVideoFile(null);
  //   setThumbnail(null);
  //   setVideoPreview("");
  //   setThumbnailPreview("");
  //   if (videoPreview) URL.revokeObjectURL(videoPreview);
  //   if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
  // };

  // const handleClose = () => {
  //   if (!uploading) {
  //     resetForm();
  //     onClose();
  //   }
  // };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
  };

  const handleUpload = async () => {
    if (!videoFile) return toast.error("Please select a video file.");
    const uploadData = new FormData();
    uploadData.append("videoFile", videoFile);
    if (thumbnail) uploadData.append("thumbnail", thumbnail);

    try {
      setUploading(true);
      setUploadProgress(0);
      const res = await videoService.uploadVideo(uploadData, (percent) => {
        setUploadProgress(percent);
      });

      toast.success("Upload complete!");
      setUploading(false);
      onclose();
      navigate(`/dashboard/${user?.username || "me"}`);
    } catch (err) {
      toast.error("Upload failed. try again.");
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-[95%] max-w-2xl p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-600">
          Upload Your Video
        </h2>

        {/* Video Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 mb-6 transition ${
            isDraggingVideo
              ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-600"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingVideo(true);
          }}
          onDragLeave={() => setIsDraggingVideo(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingVideo(false);
            const file = e.dataTransfer.files[0];
            if (file) handleVideoChange({ target: { files: [file] } });
          }}
        >
          {!videoFile ? (
            <label className="cursor-pointer flex flex-col items-center py-6">
              <UploadIcon className="w-12 h-12 mb-3 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                Drag & drop your video here or click to browse
              </p>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />
            </label>
          ) : (
            <div>
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-3">
                <div className="flex items-center gap-3">
                  <Play className="w-6 h-6 text-blue-500" />
                  <p>{videoFile.name}</p>
                </div>
                <button onClick={removeVideo} className="text-red-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {videoPreview && (
                <video
                  src={videoPreview}
                  controls
                  className="w-full rounded-lg shadow-md max-h-64"
                />
              )}
            </div>
          )}
        </div>

        {/* Thumbnail Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 mb-6 transition ${
            isDraggingThumb
              ? "border-green-400 bg-green-50 dark:bg-green-900/20"
              : "border-gray-300 dark:border-gray-600"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingThumb(true);
          }}
          onDragLeave={() => setIsDraggingThumb(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingThumb(false);
            const file = e.dataTransfer.files[0];
            if (file) handleThumbnailChange({ target: { files: [file] } });
          }}
        >
          {!thumbnail ? (
            <label className="cursor-pointer flex flex-col items-center py-6">
              <Image className="w-12 h-12 mb-3 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                Drag & drop your thumbnail here or click to browse
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <img
                src={thumbnailPreview}
                alt="Thumbnail Preview"
                className="w-48 h-28 object-cover rounded-md shadow-md"
              />
              <button
                onClick={removeThumbnail}
                className="text-red-500 text-sm hover:underline"
              >
                Remove Thumbnail
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6 overflow-hidden">
            <div
              className="bg-blue-500 h-3 transition-all"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!videoFile || uploading}
          className={`w-full py-3 font-semibold rounded-lg transition ${
            uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
          }`}
        >
          {uploading ? `Uploading... ${uploadProgress}%` : "Upload Video"}
        </button>
      </div>
    </div>
  );
};

export default VideoUploadModal;
