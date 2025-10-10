import React, { useEffect, useState } from "react";
import { interactionService } from "../services/interaction.service.js";

export default function CommentList({ videoId, refreshKey = 0 }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await interactionService.getComments(videoId);
      const payload = res?.data ?? res;
      const list = Array.isArray(payload)
        ? payload
        : payload?.comments ?? payload?.data ?? [];
      setComments(list);
    } catch (e) {
      console.error("Failed to load comments", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, refreshKey]);

  if (loading)
    return <div className="text-sm text-gray-500">Loading comments...</div>;
  if (!comments.length)
    return <div className="text-sm text-gray-500">No comments yet</div>;

  return (
    <ul className="space-y-3">
      {comments.map((c) => (
        <li key={c._id ?? c.id} className="border-b pb-2">
          <div className="text-sm font-medium">
            {c.author?.username ?? c.username ?? "User"}
          </div>
          <div className="text-sm text-gray-700">
            {c.text ?? c.content ?? c.body}
          </div>
          <div className="text-xs text-gray-400">
            {new Date(c.createdAt ?? c.created)?.toLocaleString()}
          </div>
        </li>
      ))}
    </ul>
  );
}
