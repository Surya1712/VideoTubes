import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//toggle like on video
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const existingLike = await Like.findOne({
    likedBy: req.user?._id,
    video: videoId,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res.status(200).json(new ApiResponse(200, { isLiked: false }));
  }

  await Like.create({
    likedBy: req.user?._id,
    video: videoId,
  });

  return res.status(200).json(new ApiResponse(200, { isLiked: true }));
});

//toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  const existingLike = await Like.findOne({
    likedBy: req.user?._id,
    comment: commentId,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);

    return res.status(200).json(new ApiResponse(200, { isLiked: false }));
  }

  await Like.create({
    likedBy: req.user?._id,
    comment: commentId,
  });

  return res.status(200).json(new ApiResponse(200, { isLiked: false }));
});

// toggle like on tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid TweetId");
  }

  const existingLike = await Like.findOne({
    likedBy: req.user?._id,
    tweet: tweetId,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);

    return res.status(200).json(new ApiResponse(200, { isLiked: false }));
  }

  await Like.create({
    likedBy: req.user?._id,
    tweet: tweetId,
  });

  return res.status(200).json(new ApiResponse(200, { isLiked: true }));
});

// get all liked videos
const getLikedVideos = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const likedVideosAggregate = await Like.aggregate([
    {
      $match: { likedBy: new mongoose.Types.ObjectId(req.user?._id) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideo",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                  },
                },
              ],
            },
          },
          { $unwind: "$ownerDetails" },
          {
            $project: {
              _id: 1,
              "videoFile.url": 1,
              "thumbnail.url": 1,
              owner: 1,
              title: 1,
              description: 1,
              views: 1,
              duration: 1,
              createdAt: 1,
              isPublished: 1,
              ownerDetails: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$likedVideo" },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    { $project: { _id: 0, likedVideo: 1 } },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        likedVideosAggregate,
        "liked videos fetched successfully"
      )
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
