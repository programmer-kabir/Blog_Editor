import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchBlogs } from "../../Pages/Redux/Blogs/blogSlice";
import { useDebounce } from "../Hooks/useDebounce";
import {
  LuSearch,
  LuX,
  LuClock,
  LuArrowRight,
  LuSparkles,
  LuBookOpen,
  LuCornerDownLeft,
  LuHash,
} from "react-icons/lu";

const popularSuggestions = [
  "React 19",
  "TypeScript",
  "Node.js",
  "Artificial Intelligence",
  "Kubernetes",
  "Python Polars",
  "Docker",
];

const InstantSearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const inputRef = useRef(null);

  const { Blogs = [] } = useSelector((state) => state.Blogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const debouncedSearch = useDebounce(searchTerm, 250);

  useEffect(() => {
    if (Blogs.length === 0) {
      dispatch(fetchBlogs());
    }
  }, [dispatch, Blogs.length]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K and Escape Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent or event
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filter approved blogs
  const searchResults = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return [];

    const approved = Blogs.filter((b) => b?.status === "approved");

    return approved
      .filter((blog) => {
        const titleMatch = blog?.title?.toLowerCase().includes(query);
        const catMatch = blog?.category?.toLowerCase().includes(query);
        const tagMatch = Array.isArray(blog?.tags) && blog.tags.some((t) => t.toLowerCase().includes(query));
        const authorMatch = blog?.email?.toLowerCase().includes(query);
        return titleMatch || catMatch || tagMatch || authorMatch;
      })
      .slice(0, 6);
  }, [Blogs, debouncedSearch]);

  // Handle keyboard arrow navigation inside modal
  const handleKeyNavigation = (e) => {
    if (searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = searchResults[selectedIndex];
      if (target) {
        handleNavigateToBlog(target._id);
      }
    }
  };

  const handleNavigateToBlog = (id) => {
    onClose();
    navigate(`/blogs/details/${id}`);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-elevated border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyNavigation}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-150 bg-slate-50/50">
          <LuSearch className="text-xl text-brand flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search articles by title, topic, tags, or author..."
            className="w-full text-sm sm:text-base text-slate-900 bg-transparent outline-none placeholder:text-slate-400 font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
              title="Clear input"
            >
              <LuX className="text-base" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-400 border border-slate-200 bg-white">
            ESC to close
          </span>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1">
          {/* If query has results */}
          {searchResults.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Matching Articles ({searchResults.length})
              </p>
              {searchResults.map((blog, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={blog._id}
                    onClick={() => handleNavigateToBlog(blog._id)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? "bg-brand text-white shadow-sm"
                        : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    {blog.photo ? (
                      <img
                        src={blog.photo}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                        <LuBookOpen />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-brand-light text-brand"
                          }`}
                        >
                          {blog.category || "General"}
                        </span>
                        <span
                          className={`text-[10px] flex items-center gap-1 ${
                            isSelected ? "text-white/80" : "text-slate-400"
                          }`}
                        >
                          <LuClock className="text-xs" /> 5 min read
                        </span>
                      </div>

                      <h4
                        className={`text-sm font-bold truncate mt-1 ${
                          isSelected ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {blog.title}
                      </h4>
                    </div>

                    <div
                      className={`hidden sm:flex items-center gap-1 text-xs font-semibold ${
                        isSelected ? "text-white" : "text-slate-400"
                      }`}
                    >
                      <LuCornerDownLeft className="text-xs" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* If query has NO results */}
          {debouncedSearch && searchResults.length === 0 && (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mx-auto">
                <LuSearch />
              </div>
              <h4 className="font-bold text-slate-800 text-base">
                No matching articles found
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No stories match "{debouncedSearch}". Try searching for popular topics like React, Node.js, or AI.
              </p>
            </div>
          )}

          {/* If search term is empty, show trending suggestions */}
          {!debouncedSearch && (
            <div className="p-4 space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <LuSparkles className="text-brand text-xs" />
                  <span>Popular Search Topics</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularSuggestions.map((topic, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSearchTerm(topic)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-brand-light hover:text-brand text-slate-700 transition-colors"
                    >
                      <LuHash className="text-slate-400 text-xs" />
                      <span>{topic}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Browse by Collection
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold text-slate-700">
                  <button
                    onClick={() => {
                      onClose();
                      navigate("/blogs/category/programming");
                    }}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-brand/40 hover:bg-slate-50 text-left transition-colors flex items-center justify-between"
                  >
                    <span>💻 Programming</span>
                    <LuArrowRight className="text-slate-400 text-xs" />
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      navigate("/blogs/category/technology");
                    }}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-brand/40 hover:bg-slate-50 text-left transition-colors flex items-center justify-between"
                  >
                    <span>⚡ Technology</span>
                    <LuArrowRight className="text-slate-400 text-xs" />
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      navigate("/blogs/category/devops");
                    }}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-brand/40 hover:bg-slate-50 text-left transition-colors flex items-center justify-between"
                  >
                    <span>☁️ Cloud & DevOps</span>
                    <LuArrowRight className="text-slate-400 text-xs" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-150 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline flex items-center gap-1">
              <span className="font-bold text-slate-700">↑↓</span> to navigate
            </span>
            <span className="hidden sm:inline flex items-center gap-1">
              <span className="font-bold text-slate-700">↵</span> to open
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              navigate("/blogs");
            }}
            className="text-brand font-bold hover:underline flex items-center gap-1 text-xs"
          >
            <span>View all articles</span>
            <LuArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstantSearchModal;

