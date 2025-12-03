# VideoTubes

A YouTube-like fullstack application (Frontend + Backend) for video sharing: upload, watch, like, comment, subscribe, playlists, profiles and search.

## Overview

- **Frontend**: React (Vite), Tailwind CSS, axios, react-router, context-based auth.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT auth, Cloudinary for media (typical).
- **Purpose**: Demo/clone of YouTube features for learning and extension.

## Key features

- User authentication (register / login) with access + refresh tokens.
- Upload avatar, cover images and videos (multipart/form-data).
- Video watch page with likes, comments, subscriptions and playlist support.
- Dashboard/video feed, profile pages, search.
- Playlists: create and list playlists.
- Token refresh and protected routes.

## Tech & packages (high level)

- **Frontend**: react, react-router-dom, axios, tailwindcss, lucide-react
- **Backend**: express, mongoose, jsonwebtoken, bcrypt, multer, cloudinary, cors
- **Dev**: nodemon, vite

## Repository layout

- **Frontend/** — React app (Vite)
  - **src/**
    - **components/** (UI components: VideoPlayer, LikeButton, SubscribeButton, CommentBox, etc.)
    - **context/** (AuthContext)
    - **services/** (api.js, auth.service.js, subscription.service.js, interaction.service.js)
    - **pages/** (Dashboard, Watch, Login, Register)
- **Backend-main/** — Express API
  - **src/**
    - **controllers/**
    - **models/**
    - **routes/**
    - **middlewares/**
    - **utils/**

## Quickstart (local)

1. Clone repo
2. Run backend
   - `cd Backend-main`
   - `cp .env.example .env` (fill variables)
   - `npm install`
   - `npm run dev`
3. Run frontend
   - `cd Frontend`
   - `npm install`
   - `npm run dev`
4. Open frontend (default Vite port, e.g. http://localhost:5173)

## Important environment variables (examples)

- **Backend** (.env)
  - `PORT=8000`
  - `MONGO_URI=mongodb://localhost:27017/videotubes`
  - `JWT_SECRET=your_jwt_secret`
  - `ACCESS_TOKEN_EXPIRES=15m`
  - `REFRESH_TOKEN_EXPIRES=7d`
  - `CLOUDINARY_CLOUD_NAME=...`
  - `CLOUDINARY_API_KEY=...`
  - `CLOUDINARY_API_SECRET=...`
  - `CLIENT_URL=http://localhost:5173`
- **Frontend** (.env)
  - `VITE_API_BASE_URL=http://localhost:8000/api/v1`

## API routes (common)

- `/api/v1/users/register`, `/users/login`, `/users/logout`, `/users/current-user`
- `/api/v1/videos` (list, upload, details, like)
- `/api/v1/videos/:id/comments`
- `/api/v1/subscriptions/c/:channelId` (toggle / status)
- `/api/v1/playlists`
