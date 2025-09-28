import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";

//TODO: build a health_check response that simple return the ok status as json with a message
const healthCheck = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { Message: "Everything is OK!" },
        "Health check successful"
      )
    );
});

export { healthCheck };
