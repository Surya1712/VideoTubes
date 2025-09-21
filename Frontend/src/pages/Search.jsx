import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import videoService from "../services/video.service.js";
import VideoGrid from "../components/video/VideoGrid.jsx";
import toast from "react-hot-toast";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      searchVideos();
    } else {
      setVideos([]);
      setLoading(false);
      setSearchPerformed(false);
    }
  }, [query]);

  const searchVideos = async () => {
    try {
      setLoading(true);
      setSearchPerformed(true);

      console.log(`Searching for videos with query: "${query}"`);
      const results = await videoService.searchVideos(query);

      console.log("Search results:", results);
      setVideos(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error("Search error:", error);
      toast.error(error.message || "Search failed");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrySearch = () => {
    if (query.trim()) {
      searchVideos();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          {query ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Search results for "{query}"
              </h1>
              {searchPerformed && !loading && (
                <p className="text-gray-600 dark:text-gray-400">
                  {videos.length} result{videos.length !== 1 ? "s" : ""} found
                </p>
              )}
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Search Videos
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Enter a search term to find videos
              </p>
            </>
          )}
        </div>

        {/* Search Results */}
        {query.trim() ? (
          <>
            <VideoGrid videos={videos} loading={loading} />

            {/* Empty State */}
            {!loading && searchPerformed && videos.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Results Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  No videos found matching "{query}". Try using different
                  keywords or check your spelling.
                </p>
                <div className="space-x-4">
                  <button
                    onClick={handleRetrySearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Search Again
                  </button>
                  <button
                    onClick={() => window.history.back()}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* No Query State */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Start Your Search
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Use the search bar above to find videos by title or description.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
