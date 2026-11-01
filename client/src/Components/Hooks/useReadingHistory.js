import { useState, useEffect } from "react";

const STORAGE_KEY = "blog_editor_recent_reads";
const MAX_HISTORY = 8;

export const useReadingHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load reading history:", e);
    }
  }, []);

  const addToHistory = (blog, authorName = "") => {
    if (!blog?._id) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const current = stored ? JSON.parse(stored) : [];

      // Filter out if already in history to move to top
      const filtered = current.filter((item) => item._id !== blog._id);

      const entry = {
        _id: blog._id,
        title: blog.title,
        photo: blog.photo || "",
        category: blog.category || "General",
        date: blog.date || "",
        author: authorName || "Editorial Writer",
        timestamp: Date.now(),
      };

      const updated = [entry, ...filtered].slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setHistory(updated);
    } catch (e) {
      console.error("Failed to save reading history:", e);
    }
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHistory([]);
    } catch (e) {
      console.error("Failed to clear reading history:", e);
    }
  };

  return { history, addToHistory, clearHistory };
};

