import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { status: "OK" }, "Server is running"));
});

export { healthCheck };
