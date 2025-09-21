import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import mongoose, { isValidObjectId } from "mongoose";

// ------------------ GET ALL VIDEOS ------------------
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const pipeline = [];

  // Search functionality
  if (query && query.trim()) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: query.trim(), $options: "i" } },
          { description: { $regex: query.trim(), $options: "i" } },
        ],
      },
    });
  }

  // Filter by userId if provided
  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid userId");
    }
    pipeline.push({
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    });
  }

  // Only show published videos for general listing
  pipeline.push({ $match: { isPublished: true } });

  // Sorting
  const sortOptions = {};
  if (sortBy && ["createdAt", "views", "duration", "title"].includes(sortBy)) {
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;
  } else {
    sortOptions.createdAt = -1; // Default sort by newest first
  }
  pipeline.push({ $sort: sortOptions });

  // Populate owner details
  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              "avatar.url": 1,
            },
          },
        ],
      },
    },
    { $unwind: "$ownerDetails" }
  );

  // Add additional computed fields
  pipeline.push({
    $project: {
      title: 1,
      description: 1,
      "videoFile.url": 1,
      "thumbnail.url": 1,
      duration: 1,
      views: 1,
      isPublished: 1,
      createdAt: 1,
      updatedAt: 1,
      ownerDetails: 1,
    },
  });

  const videoAggregate = Video.aggregate(pipeline);
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
  };

  const videos = await Video.aggregatePaginate(videoAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

// ------------------ PUBLISH VIDEO ------------------
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;

  // Validate required fields
  if (!title?.trim()) {
    throw new ApiError(400, "Title is required");
  }

  if (!description?.trim()) {
    throw new ApiError(400, "Description is required");
  }

  // Check for uploaded files
  const videoFilePath = req.files?.videoFile?.[0]?.path;
  const thumbnailFilePath = req.files?.thumbnail?.[0]?.path;

  if (!videoFilePath) {
    throw new ApiError(400, "Video file is required");
  }

  if (!thumbnailFilePath) {
    throw new ApiError(400, "Thumbnail file is required");
  }

  try {
    // Upload files to cloudinary
    const videoFile = await uploadOnCloudinary(videoFilePath);
    const thumbnailFile = await uploadOnCloudinary(thumbnailFilePath);

    if (!videoFile) {
      throw new ApiError(500, "Failed to upload video file");
    }

    if (!thumbnailFile) {
      throw new ApiError(500, "Failed to upload thumbnail file");
    }

    // Create video document
    const video = await Video.create({
      title: title.trim(),
      description: description.trim(),
      duration: videoFile.duration || 0,
      videoFile: videoFile.url,
      thumbnail: thumbnailFile.url,
      owner: req.user._id,
      isPublished: isPublished === "true" || isPublished === true,
      views: 0,
    });

    const populatedVideo = await Video.findById(video._id).populate(
      "owner",
      "username fullName avatar"
    );

    return res
      .status(201)
      .json(
        new ApiResponse(201, populatedVideo, "Video uploaded successfully")
      );
  } catch (error) {
    console.error("Upload error:", error);
    throw new ApiError(500, "Failed to upload video: " + error.message);
  }
});

// ------------------ GET VIDEO BY ID ------------------
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId).populate(
    "owner",
    "username fullName avatar subscribersCount"
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check if video is published or if user is the owner
  if (
    !video.isPublished &&
    video.owner._id.toString() !== req.user?._id?.toString()
  ) {
    throw new ApiError(403, "Video is not published");
  }

  // Increment view count (only if not the owner viewing their own video)
  if (req.user && video.owner._id.toString() !== req.user._id.toString()) {
    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

    // Add to user's watch history
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { WatchHistory: videoId },
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video details fetched successfully"));
});

// ------------------ UPDATE VIDEO ------------------
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (!title?.trim() && !description?.trim() && !req.file) {
    throw new ApiError(
      400,
      "At least one field (title, description, or thumbnail) is required"
    );
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check ownership
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  const updateData = {};

  // Update title if provided
  if (title?.trim()) {
    updateData.title = title.trim();
  }

  // Update description if provided
  if (description?.trim()) {
    updateData.description = description.trim();
  }

  // Update thumbnail if provided
  if (req.file?.path) {
    const newThumbnail = await uploadOnCloudinary(req.file.path);
    if (newThumbnail) {
      // Delete old thumbnail
      if (video.thumbnail?.public_id) {
        await deleteOnCloudinary(video.thumbnail.public_id);
      }

      updateData.thumbnail = {
        url: newThumbnail.url,
        public_id: newThumbnail.public_id,
      };
    }
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateData },
    { new: true }
  ).populate("owner", "username fullName avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

// ------------------ DELETE VIDEO ------------------
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check ownership
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  try {
    // Delete files from cloudinary
    if (video.videoFile?.public_id) {
      await deleteOnCloudinary(video.videoFile.public_id);
    }

    if (video.thumbnail?.public_id) {
      await deleteOnCloudinary(video.thumbnail.public_id);
    }

    // Delete video document and related data
    await Promise.all([
      Video.findByIdAndDelete(videoId),
      Like.deleteMany({ video: videoId }),
      Comment.deleteMany({ video: videoId }),
      User.updateMany(
        { WatchHistory: videoId },
        { $pull: { WatchHistory: videoId } }
      ),
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video deleted successfully"));
  } catch (error) {
    console.error("Delete error:", error);
    throw new ApiError(500, "Failed to delete video");
  }
});

// ------------------ TOGGLE PUBLISH STATUS ------------------
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check ownership
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to modify this video");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videoId: video._id,
        isPublished: video.isPublished,
      },
      `Video ${video.isPublished ? "published" : "unpublished"} successfully`
    )
  );
});

// ------------------ GET USER VIDEOS (DASHBOARD) ------------------
const getUserVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy, sortType } = req.query;
  const userId = req.user._id;

  const sortOptions = {};
  if (
    sortBy &&
    ["createdAt", "views", "title", "isPublished"].includes(sortBy)
  ) {
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;
  } else {
    sortOptions.createdAt = -1;
  }

  const pipeline = [
    { $match: { owner: new mongoose.Types.ObjectId(userId) } },
    { $sort: sortOptions },
    {
      $project: {
        title: 1,
        description: 1,
        "thumbnail.url": 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];

  const videoAggregate = Video.aggregate(pipeline);
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const videos = await Video.aggregatePaginate(videoAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "User videos fetched successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getUserVideos,
};
