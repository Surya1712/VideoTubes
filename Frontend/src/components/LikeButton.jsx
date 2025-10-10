import React, { useEffect, useState } from "react";
import { interactionService } from "../services/interaction.service.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function LikeButton({
  videoId,
  initialLiked = null,
  initialCount = null,
  onChange,
}) {
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (initialLiked !== null && initialCount !== null) return;
      try {
        const res = await interactionService.getVideo(videoId);
        const payload = res?.data ?? res;
        const likesCount =
          payload?.likesCount ?? payload?.likes ?? payload?.stats?.likes ?? 0;
        const likedByMe =
          payload?.likedByMe ?? payload?.liked ?? payload?.isLiked ?? false;
        if (mounted) {
          if (initialCount === null) setCount(likesCount);
          if (initialLiked === null) setLiked(!!likedByMe);
        }
      } catch (e) {
        console.error("Failed to load like info", e);
      }
    };
    load();
    return () => (mounted = false);
  }, [videoId]);

  const toggle = async () => {
    if (!isAuthenticated) return alert("Please login to like");
    if (loading) return;
    setLoading(true);
    const prevLiked = liked;
    const prevCount = count ?? 0;
    // optimistic update
    setLiked(!prevLiked);
    setCount(prevCount + (prevLiked ? -1 : 1));
    try {
      const res = await interactionService.toggleLike(videoId);
      const payload = res?.data ?? res;
      const serverCount = payload?.likesCount ?? payload?.likes ?? null;
      const serverLiked = payload?.likedByMe ?? payload?.liked ?? null;
      if (serverCount !== null) setCount(serverCount);
      if (serverLiked !== null) setLiked(serverLiked);
      if (onChange)
        onChange({
          liked: serverLiked ?? !prevLiked,
          count: serverCount ?? prevCount + (prevLiked ? -1 : 1),
        });
    } catch (e) {
      // rollback
      setLiked(prevLiked);
      setCount(prevCount);
      console.error("Like toggle failed", e);
      alert("Failed to update like");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-pressed={!!liked}
      className="inline-flex items-center gap-2 px-3 py-1 rounded hover:opacity-90"
    >
      <span className={`text-xl ${liked ? "text-red-600" : "text-gray-600"}`}>
        {liked ? "♥" : "♡"}
      </span>
      <span className="text-sm">{count ?? "-"}</span>
    </button>
  );
}
