import React, { useEffect, useState } from "react";
import { subscriptionService } from "../services/subscription.service.js";
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
        if (!channelId) {
          console.warn("SubscribeButton: no channelId provided");
          setSubscribed(false);
          return;
        }

        const response = await subscriptionService.getUserSubscriptionStatus(
          channelId
        );

        // Normalize response shapes. Backend may return:
        // - { subscribed: true }
        // - { data: { subscribed: true } }
        // - { data: { data: { subscribed: true } } }
        // - axios response shapes in some callers
        let subscribedStatus = false;
        if (response === true || response === false)
          subscribedStatus = response;
        else if (response && typeof response.subscribed === "boolean")
          subscribedStatus = response.subscribed;
        else if (
          response &&
          response.data &&
          typeof response.data.subscribed === "boolean"
        )
          subscribedStatus = response.data.subscribed;
        else if (
          response &&
          response.data &&
          response.data.data &&
          typeof response.data.data.subscribed === "boolean"
        )
          subscribedStatus = response.data.data.subscribed;

        console.log("fetched subscription status : ", subscribedStatus);

        if (mounted) {
          setSubscribed(Boolean(subscribedStatus));
        }
      } catch (err) {
        // Provide clearer error to user and keep UI stable
        console.warn(
          "Failed to fetch subscription status (channel ID may be invalid, or API failed):",
          err
        );
        if (mounted) setSubscribed(false);
        // Show friendly message for 4xx/5xx
        if (err?.response?.status === 404) {
          toast.error("Subscription status not found for this channel.");
        } else if (err?.response?.status >= 400) {
          toast.error(err.message || "Failed to fetch subscription status");
        }
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
      // Normalize response shapes for toggle endpoint
      // Backend returns ApiResponse wrapped object: { data: { subscribed: true } }
      let newStatus = false;
      if (response === true || response === false) newStatus = response;
      else if (response && typeof response.subscribed === "boolean")
        newStatus = response.subscribed;
      else if (
        response &&
        response.data &&
        typeof response.data.subscribed === "boolean"
      )
        newStatus = response.data.subscribed;
      else if (
        response &&
        response.data &&
        response.data.data &&
        typeof response.data.data.subscribed === "boolean"
      )
        newStatus = response.data.data.subscribed;

      setSubscribed(Boolean(newStatus));
      toast.success(newStatus ? "Subscribed!" : "Unsubscribed.");
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
