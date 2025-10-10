import React, { useEffect, useState } from "react";
import { subscriptionService } from "../services/subscriptionService.js";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

export default function SubscribeButton({ channelId }) {
  const { isAuthenticated } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load subscription status on mount
  useEffect(() => {
    let mounted = true;

    const loadStatus = async () => {
      if (!isAuthenticated) {
        setSubscribed(false);
        return;
      }
      setLoading(true);
      try {
        const response = await subscriptionService.getUserSubscriptionStatus(
          channelId
        );

        const subscribedStatus = response?.data?.data?.subscribed;
        console.log("fetched subscription status : ", subscribedStatus);

        if (mounted && typeof subscribedStatus === "boolean") {
          setSubscribed(subscribedStatus);
        }
      } catch (err) {
        console.warn(
          "Failed to fetch subscription status (channel ID may be invalid, or API failed):",
          err
        );
        if (mounted) setSubscribed(false);
      }
    };

    loadStatus();
    return () => (mounted = false);
  }, [channelId, isAuthenticated]);

  // Toggle subscription (one-time)
  const handleSubscribe = async () => {
    if (!isAuthenticated) return alert("Please login to subscribe");

    if (loading) return; // disable if already subscribed

    setLoading(true);

    try {
      const response = await subscriptionService.toggleSubscription(channelId);
      const newStatus = response?.data?.data?.subscribed;

      if (typeof newStatus === "boolean") {
        setSubscribed(newStatus);
        const message = newStatus
          ? "subscribed successfully!"
          : "Unsubscribed.";
        toast.success(message);
      }
    } catch (err) {
      console.error("Failed to toggle subscription:", err);
      toast.error(err.message || "Failed to change subscription status.");
    } finally {
      setLoading(false);
    }
  };
  // --- 3. Render Button based on state ---
  if (!isAuthenticated) {
    return (
      <button
        onClick={() => alert("please login to subscribe.")}
        className="px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
      >
        Subscribe
      </button>
    );
  }

  if (loading) {
    return (
      <button
        disabled={true}
        className="px-4 py-1 rounded bg-gray-400 text-white disabled:opacity-70 transition-colors"
      >
        {subscribed ? "Updating..." : "Loading..."}
      </button>
    );
  }

  if (subscribed)
    return (
      <button
        onClick={handleSubscribe}
        className="px-4 py-1 rounded bg-gray-600 text-white hover:bg-gray-700 transition-colors"
      >
        Subscribed
      </button>
    );

  return (
    <button
      onClick={handleSubscribe}
      className={`px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors`}
    >
      Subscribe
    </button>
  );
}
