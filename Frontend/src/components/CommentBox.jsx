import React, { useState } from "react";
import { interactionService } from "../services/interaction.service.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function CommentBox({ videoId, onAdded }) {
  const { isAuthenticated } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!isAuthenticated) return alert("Please login to comment");
    const trimmed = (text || "").trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await interactionService.addComment(videoId, trimmed);
      setText("");
      if (onAdded) {
        // pass server response so parent can refresh / update
        onAdded(res);
      }
    } catch (e) {
      console.error("Comment add failed", e);
      alert("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment..."
        rows={3}
        className="w-full p-2 border rounded"
      />
      <div className="flex justify-end">
        <button
          onClick={submit}
          disabled={loading || !text.trim()}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
