import React, { useEffect, useState } from "react";
import { interactionService } from "../services/interaction.service.js";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { ListVideo } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
export default function PlaylistMenu() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const load = async () => {
    if (!user || !user._id) {
      setLoading(false);
      console.log("User ID is missing. Cannot load Playlist.");
      return;
    }
    setLoading(true);
    try {
      const res = await interactionService.getPlaylists(user._id);
      const payload = res?.data ?? res;
      const list = Array.isArray(payload)
        ? payload
        : payload?.playlists ?? payload?.data ?? [];
      setPlaylists(list);
    } catch (e) {
      console.error("Failed to load playlists", e);
      toast.error("Failed to load playlists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const create = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await interactionService.createPlaylist({
        name: newTitle.trim(),
        description: newDescription.trim(),
      });
      setNewTitle("");
      setNewDescription("");
      await load();
      toast.success("Playlist created successfully!"); // UX Improvement
    } catch (e) {
      console.error("Failed to create playlist", e);

      toast.error(e.message || "Failed to create playlist");
    } finally {
      setCreating(false);
    }
  };
  //start editing
  const handleEditClick = (playlist) => {
    setEditingPlaylistId(playlist._id ?? playlist.id);
    setEditName(playlist.name ?? playlist.title);
    setEditDescription(playlist.description || "");
  };
  //save updates
  const handleUpdate = async () => {
    if (!editName.trim()) return;
    setIsUpdating(true);
    try {
      await interactionService.updatePlaylist(editingPlaylistId, {
        name: editName.trim(),
        description: editDescription.trim(),
      });
      toast.success("Playlist update successfully!");
      setEditingPlaylistId(null);
      await load();
    } catch (error) {
      console.error("Failed to update playlist", error);
      toast.error(error.message || "Failed to update playlist");
    } finally {
      setIsUpdating(false);
    }
  };
  const handleDelete = async (playlistId) => {
    if (!window.confirm("Are you sure you want to delete this playlist?")) {
      return;
    }
    try {
      await interactionService.deletePlaylist(playlistId);
      toast.success("Playlist deleted successfully!");
      await load(); // reload the list
    } catch (e) {
      console.error("Failed to delete playlist", e);
      toast.error(e.message || "Failed to delete playlist");
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      <div className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
        Your Playlists
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-sm py-4">
          No playlists yet. Create your first playlist!
        </div>
      ) : (
        <ul className="space-y-2 mb-4">
          {playlists.map((p) => (
            <li
              key={p._id ?? p.id}
              className="p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex justify-between items-center"
            >
              <Link
                to={`/playlists/${p._id ?? p.id}`} // <--- NEW LINK PATH
                className="flex items-center w-full min-w-0 pr-4" // Flex for icon + text
              >
                {/* Playlist Icon */}
                <ListVideo className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />

                {/* Playlist Details */}
                <div className="min-w-0 flex-grow">
                  <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {p.name ?? p.title}
                  </div>
                  {p.totalVideos !== undefined && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {p.totalVideos} videos
                    </div>
                  )}
                </div>
              </Link>

              {/* Action Buttons (Visible only in View Mode) */}
              {editingPlaylistId !== (p._id ?? p.id) && (
                <div className="flex space-x-2 ml-4">
                  {/* Edit Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(p);
                    }}
                    className="text-gray-500 hover:text-blue-600 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Edit Playlist"
                  >
                    {/* Replace with an actual Edit/Pencil icon */}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-1.5a3.5 3.5 0 01-5 5L8 16l-3 1 1-3 1.5-1.5a3.5 3.5 0 015-5z"
                      ></path>
                    </svg>
                  </button>

                  {/* Delete Button (from step 1) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p._id ?? p.id);
                    }}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Delete Playlist"
                  >
                    {/* Trash icon from step 1 */}
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 space-y-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Playlist name"
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          disabled={creating}
        />
        {/* FIX: Added description textarea */}
        <textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Playlist description"
          rows={2}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
          disabled={creating}
        />
        <button
          onClick={create}
          disabled={creating || !newTitle.trim() || !newDescription.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {creating ? "Creating..." : "Create Playlist"}
        </button>
      </div>
    </div>
  );
}
