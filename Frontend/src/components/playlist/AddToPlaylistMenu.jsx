import React, { useEffect, useState, useRef } from "react";
import { interactionService } from "../../services/interaction.service";
import { useAuth } from "../../context/AuthContext.jsx";
import { toast } from "react-hot-toast";
import { ListPlus, Loader2, Check, Plus } from "lucide-react";
import { Description } from "@headlessui/react";

const AddToPlaylistMenu = ({ videoId }) => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);
  // close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const loadPlaylists = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const response = await interactionService.getPlaylists(user._id); //check user id passed
      const list = response?.data?.playlists ?? response?.data ?? [];

      /**
       *! Check if the video is already in the playlist (ideally, the API should return this info).
       *  Check if the video already exists in the playlist.
       * Ideally, the API should tell us which playlists include this video.
       * Right now, `getPlaylists` doesn’t provide that info, so we have two options:
       * 1. Update `getUserPlaylists` to include a flag like `containsVideo: true/false`.
       * 2. Or, fetch each playlist with `getPlaylistById` (less efficient).
       * For now, we’ll assume the existing API response is enough to show the playlists.
       * */
      setPlaylists(
        list.map((p) => ({
          ...p,
          // Check if the current video is already in p.videos (best done on the backend).
          containsVideo:
            p.videos?.some((v) => v._id === videoId || v === videoId) || false,
        }))
      );
    } catch (error) {
      console.error("Failed to load playlists for menu", error);
      toast.error("Failed to load playlists");
    } finally {
      setLoading(false);
    }
  };

  // handle new playlist creation and add video to it
  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim() || creating) return;

    setCreating(true);

    try {
      //create playlist
      const createRes = await interactionService.createPlaylist({
        name: newTitle.trim(),
        description: newDescription.trim(),
      });

      const newPlaylistId =
        createRes.data?._id || createRes.data?.id || createRes._id;

      if (!newPlaylistId) {
        throw new Error("Failed to get new playlist ID.");
      }
      //Add the current video to the new playlist
      await interactionService.addVideoToPlaylist(videoId, newPlaylistId);
      toast.success(`Playlist ${newTitle} Created and video added!`);

      //reset state & close
      setNewTitle("");
      setNewDescription("");
      setIsCreatingNew(false); // close creation form
      await loadPlaylists(); // reload the list to show new playlist
    } catch (error) {
      console.error("Failed to create and add video to playlist", error);
      toast.error(error.message || "Failed to create playlist");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleVideo = async (playlistId, isCurrentlyInPlaylist) => {
    if (!user?._id) {
      toast.error("Please log in to manage playlists.");
      return;
    }
    try {
      let message;
      if (isCurrentlyInPlaylist) {
        // remove video
        await interactionService.removeVideoFromPlaylist(videoId, playlistId);
        message = "Video removed from playlist!";
      } else {
        //add video
        await interactionService.addVideoToPlaylist(videoId, playlistId);
        message = "Video added to playlist";
      }
      toast.success(message);
      // Update the local state right away for a faster feel.
      setPlaylists((prev) =>
        prev.map((p) =>
          p._id === playlistId
            ? { ...p, containsVideo: !isCurrentlyInPlaylist }
            : p
        )
      );
    } catch (error) {
      console.error("Failed to toggle video in playlist", error);
      toast.error(error.massage || "Failed to update Playlist");
    }
  };

  // fetch playlist menu opens
  useEffect(() => {
    if (isOpen) {
      loadPlaylists();
    }
  }, [isOpen]);
  //   if user is not logged in don't show the component
  if (!user) {
    return null;
  }

  // base btn style(for both 3-dot and Watch page button)

  const baseButtonStyle =
    "flex items-center justify-center p-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400";

  return (
    <div className="relative" ref={menuRef}>
      {/* Button to open the menu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={baseButtonStyle}
        title="Save to Playlist"
      >
        <ListPlus className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-3 font-semibold text-gray-900 dark:text-white border-b dark:border-gray-700">
            Save to...
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {loading ? (
              <li className="p-3 text-center text-gray-500 dark:text-gray-400 flex items-center justify-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading Playlists...
              </li>
            ) : playlists.length === 0 ? (
              <li className="p-3 text-center text-gray-500 dark:text-gray-400">
                No playlists found.
              </li>
            ) : (
              playlists.map((p) => (
                <li
                  key={p._id}
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  // FIX: Pass the playlist ID (p._id) and the video status (p.containsVideo)
                  onClick={() => handleToggleVideo(p._id, p.containsVideo)}
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {p.name}
                  </span>
                  {p.containsVideo ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 border border-gray-400 dark:border-gray-600 rounded-sm"></div> // Checkbox placeholder
                  )}
                </li>
              ))
            )}
          </ul>
          {/* Create New Playlist Section */}
          <div className="p-3 border-t dark:border-gray-700">
            {!isCreatingNew ? (
              // Button to trigger the creation form
              <button
                onClick={() => setIsCreatingNew(true)}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" /> Create new playlist
              </button>
            ) : (
              // Creation Form
              <form onSubmit={handleCreatePlaylist} className="space-y-2">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Playlist Name (required)"
                  className="w-full px-2 py-1 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500"
                  disabled={creating}
                  autoFocus // Focus on input when form opens
                />
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full px-2 py-1 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none focus:ring-blue-500"
                  disabled={creating}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNew(false);
                      setNewTitle("");
                      setNewDescription("");
                    }}
                    className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={creating || !newTitle.trim()}
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddToPlaylistMenu;
