import React, { useState } from "react";
import { interactionService } from "../services/interaction.service.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function TweetComposer({ onPosted }) {
  const { isAuthenticated } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const post = async () => {
    if (!isAuthenticated) return alert("Please login to post");
    const trimmed = (text || "").trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await interactionService.postTweet(trimmed);
      setText("");
      if (onPosted) onPosted(res);
    } catch (e) {
      console.error("Tweet post failed", e);
      alert("Failed to post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's happening?"
        rows={3}
        className="w-full p-2 border rounded"
      />
      <div className="flex justify-end">
        <button
          onClick={post}
          disabled={loading || !text.trim()}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          {loading ? "Posting..." : "Tweet"}
        </button>
      </div>
    </div>
  );
}
