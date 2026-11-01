import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../Hooks/useAuth";
import {
  LuBell,
  LuCheckCheck,
  LuCheck,
  LuTrash2,
  LuSparkles,
  LuMessageSquare,
  LuHeart,
  LuUserPlus,
  LuShieldAlert,
  LuExternalLink,
  LuX,
  LuFilter,
  LuVolume2,
  LuVolumeX,
  LuRefreshCw,
} from "react-icons/lu";

// Format human-friendly time ago
const formatTimeAgo = (dateString) => {
  if (!dateString) return "Recently";
  const now = new Date();
  const past = new Date(dateString);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 45) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Notification type badges and icons
const getNotificationTypeConfig = (type) => {
  switch (type) {
    case "comment":
      return {
        badge: "💬",
        bg: "bg-blue-100 text-blue-700",
        pill: "bg-blue-50 text-blue-600 border-blue-200",
      };
    case "reply":
      return {
        badge: "↩️",
        bg: "bg-indigo-100 text-indigo-700",
        pill: "bg-indigo-50 text-indigo-600 border-indigo-200",
      };
    case "reaction":
      return {
        badge: "👏",
        bg: "bg-amber-100 text-amber-700",
        pill: "bg-amber-50 text-amber-600 border-amber-200",
      };
    case "follow":
      return {
        badge: "👤",
        bg: "bg-emerald-100 text-emerald-700",
        pill: "bg-emerald-50 text-emerald-600 border-emerald-200",
      };
    case "blog_status":
      return {
        badge: "🎉",
        bg: "bg-purple-100 text-purple-700",
        pill: "bg-purple-50 text-purple-600 border-purple-200",
      };
    default:
      return {
        badge: "🔔",
        bg: "bg-slate-100 text-slate-700",
        pill: "bg-slate-50 text-slate-600 border-slate-200",
      };
  }
};

// Subtle modern notification chime using Web Audio API
const playNotificationChime = () => {
  try {
    const isMuted = localStorage.getItem("blog_notif_sound") === "false";
    if (isMuted) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.32);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.32);
  } catch (e) {}
};

const NotificationDropdown = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'unread'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem("blog_notif_sound") !== "false"
  );
  const [toastNotif, setToastNotif] = useState(null);

  const dropdownRef = useRef(null);
  const prevCountRef = useRef(0);
  const initialLoadRef = useRef(true);

  // Toggle Sound Preference
  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    localStorage.setItem("blog_notif_sound", nextState ? "true" : "false");
    if (nextState) {
      playNotificationChime();
    }
  };

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (showRefreshAnim = false) => {
      if (!user?.email) return;
      if (showRefreshAnim) setIsRefreshing(true);
      try {
        const [listRes, countRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_API_URL}/notifications?email=${encodeURIComponent(
              user.email
            )}`
          ),
          axios.get(
            `${import.meta.env.VITE_API_URL}/notifications/unread-count?email=${encodeURIComponent(
              user.email
            )}`
          ),
        ]);

        const newCount = countRes.data?.count || 0;
        const newList = listRes.data || [];

        // If new unread notifications arrived after initial load
        if (
          !initialLoadRef.current &&
          newCount > prevCountRef.current &&
          newList.length > 0
        ) {
          playNotificationChime();
          const latestItem = newList[0];
          setToastNotif(latestItem);
          setTimeout(() => setToastNotif(null), 5000);
        }

        initialLoadRef.current = false;
        prevCountRef.current = newCount;
        setNotifications(newList);
        setUnreadCount(newCount);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        if (showRefreshAnim) {
          setTimeout(() => setIsRefreshing(false), 400);
        }
      }
    },
    [user?.email]
  );

  useEffect(() => {
    if (user?.email) {
      fetchNotifications();
      // Poll every 20 seconds for real-time alerts
      const interval = setInterval(() => fetchNotifications(false), 20000);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, user?.email]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (!user?.email) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/notifications/read`, {
        email: user.email,
        all: true,
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      prevCountRef.current = 0;
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Mark single notification as read without closing dropdown
  const handleMarkSingleRead = async (e, notifId) => {
    e.stopPropagation();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/notifications/read`, {
        id: notifId,
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      prevCountRef.current = Math.max(0, prevCountRef.current - 1);
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    if (!user?.email) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/notifications`, {
        data: {
          email: user.email,
          all: true,
        },
      });
      setNotifications([]);
      setUnreadCount(0);
      prevCountRef.current = 0;
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  // Click on a notification item: marks read, navigates, and handles hash scrolling
  const handleItemClick = async (notif) => {
    try {
      if (!notif.read) {
        await axios.put(`${import.meta.env.VITE_API_URL}/notifications/read`, {
          id: notif._id,
        });
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        prevCountRef.current = Math.max(0, prevCountRef.current - 1);
      }
      setIsOpen(false);
      setToastNotif(null);

      if (notif.link) {
        const [path, hash] = notif.link.split("#");
        navigate(notif.link);
        if (hash) {
          setTimeout(() => {
            const target = document.getElementById(hash);
            if (target) {
              target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 250);
        }
      }
    } catch (err) {
      console.error("Failed to process notification click:", err);
    }
  };

  // Delete single notification
  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/notifications`, {
        data: { id },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      fetchNotifications();
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  if (!user?.email) return null;

  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Bell Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative p-2 rounded-xl transition-all duration-200 border ${
            isOpen
              ? "bg-brand-light text-brand border-brand/30 shadow-xs"
              : "text-slate-700 hover:text-brand hover:bg-slate-100 border-transparent hover:border-slate-200"
          }`}
          title="Notification Center"
          aria-label="Notification Center"
          aria-expanded={isOpen}
        >
          <LuBell className="w-5 h-5 transition-transform duration-200 hover:scale-105" />

          {/* Unread Ping Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-rose-500 text-[10px] font-black text-white shadow-sm ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
        </button>

        {/* Dropdown Card */}
        {isOpen && (
          <div className="absolute right-0 mt-2.5 w-[calc(100vw-2rem)] sm:w-96 max-w-[400px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            {/* Top Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Notifications</span>
                </h4>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-600 animate-pulse">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              {/* Header Action Tools */}
              <div className="flex items-center gap-1.5">
                {/* Manual Refresh */}
                <button
                  onClick={() => fetchNotifications(true)}
                  className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all ${
                    isRefreshing ? "animate-spin text-brand" : ""
                  }`}
                  title="Refresh Notifications"
                >
                  <LuRefreshCw className="w-3.5 h-3.5" />
                </button>

                {/* Sound On / Mute Toggle */}
                <button
                  onClick={toggleSound}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
                  title={
                    soundEnabled
                      ? "Mute notification sounds"
                      : "Unmute notification sounds"
                  }
                >
                  {soundEnabled ? (
                    <LuVolume2 className="w-3.5 h-3.5 text-indigo-600" />
                  ) : (
                    <LuVolumeX className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {/* Mark All Read */}
                {notifications.some((n) => !n.read) && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-brand hover:bg-brand-light transition-colors"
                    title="Mark all notifications as read"
                  >
                    <LuCheckCheck className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Mark read</span>
                  </button>
                )}

                {/* Clear All */}
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Clear all notifications"
                  >
                    <LuTrash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs: All vs Unread */}
            <div className="flex items-center gap-2 px-5 py-2.5 bg-white border-b border-slate-100 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === "all"
                    ? "bg-slate-900 text-white shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab("unread")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === "unread"
                    ? "bg-brand text-white shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* List of Notifications */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 px-6 text-center">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center text-xl mx-auto mb-2">
                    🔕
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    {activeTab === "unread"
                      ? "No unread notifications!"
                      : "All caught up!"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {activeTab === "unread"
                      ? "You have reviewed all recent updates."
                      : "No new activity or alerts right now."}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const typeConfig = getNotificationTypeConfig(notif.type);
                  return (
                    <div
                      key={notif._id}
                      onClick={() => handleItemClick(notif)}
                      className={`p-3.5 sm:p-4 flex items-start gap-3 cursor-pointer transition-colors relative group ${
                        notif.read
                          ? "bg-white hover:bg-slate-50/80"
                          : "bg-indigo-50/40 hover:bg-indigo-50/70"
                      }`}
                    >
                      {/* Avatar with Type Mini Badge */}
                      <div className="shrink-0 relative">
                        {notif.senderImage ? (
                          <img
                            src={notif.senderImage}
                            alt={notif.senderName || "Sender"}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}

                        {/* Fallback Icon if no image */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-xs ${
                            typeConfig.bg
                          } ${notif.senderImage ? "hidden" : "flex"}`}
                        >
                          {typeConfig.badge}
                        </div>

                        {/* Mini Badge Overlay */}
                        {notif.senderImage && (
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow-xs flex items-center justify-center text-[10px] ring-1 ring-slate-100">
                            {typeConfig.badge}
                          </span>
                        )}

                        {/* Unread dot */}
                        {!notif.read && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-brand rounded-full ring-2 ring-white"></span>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 min-w-0 pr-12">
                        <p
                          className={`text-xs ${
                            notif.read
                              ? "text-slate-800 font-semibold"
                              : "text-slate-900 font-bold"
                          } line-clamp-1`}
                        >
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>

                      {/* Quick Action Buttons on Hover */}
                      <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.read && (
                          <button
                            onClick={(e) => handleMarkSingleRead(e, notif._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand hover:bg-brand-light transition-all"
                            title="Mark as read"
                          >
                            <LuCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDeleteNotif(e, notif._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                          title="Delete notification"
                        >
                          <LuTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Dropdown Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 bg-slate-50 text-center border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">
                  Showing {filteredNotifications.length} of {notifications.length}
                </span>
                <span className="text-[10px] text-brand font-semibold">
                  Auto-updates live
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Toast Alert on New Notification Arrival */}
      {toastNotif && (
        <div
          onClick={() => handleItemClick(toastNotif)}
          className="fixed bottom-6 right-6 max-w-sm w-[90%] bg-white rounded-2xl shadow-elevated border border-indigo-100 p-4 z-50 flex items-start gap-3 cursor-pointer animate-in slide-in-from-bottom-5 duration-300 hover:scale-102 transition-transform"
        >
          <div className="w-9 h-9 rounded-full bg-brand-light text-brand flex items-center justify-center shrink-0 text-base">
            🔔
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 truncate">
                {toastNotif.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setToastNotif(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <LuX className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-snug">
              {toastNotif.message}
            </p>
            <span className="text-[9px] font-bold text-brand uppercase tracking-wider mt-1 block">
              Tap to view &rarr;
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationDropdown;
