import React, { useEffect, useState } from "react";
import { interactionService } from "../services/interaction.service.js";
import LikeButton from "./LikeButton.jsx";
import SubscribeButton from "./SubscribeButton.jsx";
import CommentList from "./CommentList.jsx";
import CommentBox from "./CommentBox.jsx";
import PlaylistMenu from "./PlaylistMenu.jsx";

export default function VideoPlayer({ videoId }) {
  const [video, setVideo] = useState(null);
  const [commentsKey, setCommentsKey] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await interactionService.getVideo(videoId);
      const payload = res?.data ?? res;
      setVideo(payload);
    } catch (e) {
      console.error("Failed to load video", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  if (loading) return <div>Loading video...</div>;
  if (!video) return <div>Video not found</div>;

  // adapt common shapes
  const vid = video?.data ?? video;
  const title = vid?.title ?? vid?.name ?? "Untitled";
  const src = vid?.url ?? vid?.videoUrl ?? vid?.source;
  const uploaderId = vid?.uploader?._id ?? vid?.uploaderId ?? vid?.authorId;
  const likesCount = vid?.likesCount ?? vid?.likes ?? vid?.stats?.likes;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div>
        <video src={src} controls className="w-full bg-black rounded" />
      </div>

      <div className="flex items-center justify-between">
        <LikeButton
          videoId={videoId}
          initialLiked={vid?.likedByMe}
          initialCount={likesCount}
        />
        <SubscribeButton
          channelId={uploaderId}
          initialSubscribed={vid?.uploaderSubscribed}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <CommentBox
            videoId={videoId}
            onAdded={() => setCommentsKey((k) => k + 1)}
          />
          <CommentList videoId={videoId} refreshKey={commentsKey} />
        </div>
        <div>
          <PlaylistMenu />
        </div>
      </div>
    </div>
  );
}
