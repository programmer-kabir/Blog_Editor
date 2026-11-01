import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchComments } from "../../../Pages/Redux/Comments/commentSlice";
import useAuth from "../../Hooks/useAuth";
import axios from "axios";
import toast from "react-hot-toast";
import {
  LuMessageSquare,
  LuPencil,
  LuTrash2,
  LuX,
  LuCornerDownRight,
  LuSend,
  LuChevronDown,
  LuChevronUp,
  LuSparkles,
  LuUser,
  LuClock,
} from "react-icons/lu";

// Format time ago
const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const now = new Date();
  const past = new Date(dateString);
  const diffSec = Math.floor((now - past) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  return `${diffDays}d ago`;
};

// Highlight @mentions in comments and replies
const renderFormattedText = (text) => {
  if (!text) return "";
  const parts = text.split(/(@[a-zA-Z0-9_\s]+?(?=\s|[.,!?]|$))/g);
  return parts.map((part, index) => {
    if (part.startsWith("@")) {
      return (
        <span
          key={index}
          className="font-bold text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100"
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

const ShowComments = ({ id, articleAuthorEmail = "" }) => {
  const { user } = useAuth();
  const { Comments = [] } = useSelector((state) => state.Comments);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchComments());
  }, [dispatch, id]);

  const currentComments = Comments.find((comment) => comment.blogId === id);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");

  // Reply states
  const [activeReplyCommentId, setActiveReplyCommentId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [collapsedThreads, setCollapsedThreads] = useState({});

  const openEditModal = (commentItem) => {
    setEditingCommentId(commentItem.id);
    setEditText(commentItem.comment);
  };

  const closeEditModal = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  const handleCommentEdit = async (commentId) => {
    if (!editText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    const data = {
      blogId: currentComments.blogId,
      id: commentId,
      comment: editText.trim(),
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/comments`,
        data
      );
      toast.success(response?.data?.message || "Comment updated");
      dispatch(fetchComments());
      closeEditModal();
    } catch (err) {
      toast.error("Failed to update comment");
    }
  };

  const handleCommentDelete = async (commentId) => {
    const data = {
      blogId: currentComments.blogId,
      id: commentId,
    };

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/comments`,
        { data }
      );
      toast.success(response?.data?.message || "Comment deleted");
      dispatch(fetchComments());
    } catch (error) {
      toast.error("Error deleting comment");
    }
  };

  // Toggle Reply box
  const toggleReplyBox = (commentId, commenterName) => {
    if (!user) {
      toast.error("Please sign in to reply to this discussion");
      return;
    }
    if (activeReplyCommentId === commentId) {
      setActiveReplyCommentId(null);
      setReplyText("");
    } else {
      setActiveReplyCommentId(commentId);
      setReplyText(`@${commenterName} `);
    }
  };

  // Submit Reply
  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error("Reply text cannot be empty");
      return;
    }

    try {
      setIsSubmittingReply(true);
      const payload = {
        blogId: id,
        commentId,
        reply: {
          email: user.email,
          name: user.displayName || user.email?.split("@")[0] || "Reader",
          image: user.photoURL || "",
          text: replyText.trim(),
        },
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}/comments/reply`,
        payload
      );

      toast.success("Reply added to thread!");
      setActiveReplyCommentId(null);
      setReplyText("");
      dispatch(fetchComments());
    } catch (err) {
      toast.error("Failed to post reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Delete Reply
  const handleDeleteReply = async (commentId, replyId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/comments/reply`, {
        data: {
          blogId: id,
          commentId,
          replyId,
        },
      });
      toast.success("Reply deleted");
      dispatch(fetchComments());
    } catch (err) {
      toast.error("Failed to delete reply");
    }
  };

  // Toggle Collapse Thread
  const toggleCollapse = (commentId) => {
    setCollapsedThreads((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const commentList = currentComments?.comments || [];

  return (
    <div className="mt-8 pt-8 border-t border-slate-150">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LuMessageSquare className="text-brand text-lg" />
          <h3 className="text-lg font-bold text-slate-900">
            Discussion & Threaded Replies ({commentList.length})
          </h3>
        </div>
      </div>

      {commentList.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200/80">
          <p className="text-sm text-slate-500">
            No comments yet. Be the first to share your perspective!
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {commentList.map((c) => {
            const replies = Array.isArray(c.replies) ? c.replies : [];
            const isThreadCollapsed = !!collapsedThreads[c.id];
            const isCommentAuthor = c.email === articleAuthorEmail;

            return (
              <div
                key={c.id}
                className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Main Comment */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {/* User Avatar linking to Author Profile */}
                    <Link
                      to={`/author/${encodeURIComponent(c.email || "")}`}
                      className="group shrink-0"
                      title={`View ${c.name}'s Profile`}
                    >
                      {c.image ? (
                        <img
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-indigo-500 transition-all"
                          src={c.image}
                          alt={c.name || "User"}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand-light text-brand font-bold text-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                          {(c.name || c.email || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </Link>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/author/${encodeURIComponent(c.email || "")}`}
                          className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                        >
                          {c.name || "Reader"}
                        </Link>

                        {/* Author Badge */}
                        {isCommentAuthor && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <LuSparkles className="w-3 h-3" />
                            Author
                          </span>
                        )}

                        {c.email === user?.email && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-light text-brand">
                            You
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {renderFormattedText(c.comment)}
                      </p>

                      {/* Comment Actions: Reply, Collapse, Edit, Delete */}
                      <div className="flex items-center gap-4 pt-1">
                        <button
                          onClick={() => toggleReplyBox(c.id, c.name || "Reader")}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                          <LuCornerDownRight className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </button>

                        {replies.length > 0 && (
                          <button
                            onClick={() => toggleCollapse(c.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors"
                          >
                            {isThreadCollapsed ? (
                              <>
                                <LuChevronDown className="w-3.5 h-3.5" />
                                <span>Show {replies.length} replies</span>
                              </>
                            ) : (
                              <>
                                <LuChevronUp className="w-3.5 h-3.5" />
                                <span>Hide replies</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for comment owner */}
                  {c.email === user?.email && (
                    <div className="flex items-center gap-2 self-end sm:self-start">
                      <button
                        onClick={() => openEditModal(c)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-brand hover:bg-brand-light/50 rounded-lg transition-colors"
                        title="Edit comment"
                      >
                        <LuPencil className="text-xs" /> Edit
                      </button>
                      <button
                        onClick={() => handleCommentDelete(c.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete comment"
                      >
                        <LuTrash2 className="text-xs" /> Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Inline Reply Input Box */}
                {activeReplyCommentId === c.id && (
                  <form
                    onSubmit={(e) => handleReplySubmit(e, c.id)}
                    className="mt-4 ml-6 sm:ml-12 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in duration-150"
                  >
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-600">
                      <LuCornerDownRight className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Replying to {c.name || "thread"}</span>
                    </div>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your thoughtful reply..."
                      rows="2"
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-slate-800"
                    />
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setActiveReplyCommentId(null)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-200 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingReply}
                        className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                      >
                        <LuSend className="w-3 h-3" />
                        <span>{isSubmittingReply ? "Posting..." : "Reply"}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Nested Threaded Replies List */}
                {replies.length > 0 && !isThreadCollapsed && (
                  <div className="mt-4 ml-4 sm:ml-12 pl-4 border-l-2 border-indigo-100 space-y-3.5">
                    {replies.map((reply) => {
                      const isReplyAuthor = reply.email === articleAuthorEmail;
                      const isOwnReply = reply.email === user?.email;

                      return (
                        <div
                          key={reply.id}
                          className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start justify-between gap-3"
                        >
                          <div className="flex items-start gap-2.5">
                            <Link
                              to={`/author/${encodeURIComponent(reply.email || "")}`}
                              className="shrink-0"
                            >
                              {reply.image ? (
                                <img
                                  src={reply.image}
                                  alt={reply.name}
                                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                                  {(reply.name || "U").charAt(0).toUpperCase()}
                                </div>
                              )}
                            </Link>

                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link
                                  to={`/author/${encodeURIComponent(reply.email || "")}`}
                                  className="text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                                >
                                  {reply.name || "Reader"}
                                </Link>

                                {isReplyAuthor && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-700">
                                    <LuSparkles className="w-2.5 h-2.5" />
                                    Author
                                  </span>
                                )}

                                {isOwnReply && (
                                  <span className="text-[9px] font-semibold text-slate-400">
                                    (You)
                                  </span>
                                )}

                                {reply.createdAt && (
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    • {formatTimeAgo(reply.createdAt)}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {renderFormattedText(reply.text)}
                              </p>
                            </div>
                          </div>

                          {/* Delete reply for owner */}
                          {isOwnReply && (
                            <button
                              onClick={() => handleDeleteReply(c.id, reply.id)}
                              className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                              title="Delete reply"
                            >
                              <LuTrash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Comment Modal */}
      {editingCommentId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-elevated p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">Edit Comment</h4>
              <button
                onClick={closeEditModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-slate-800"
                placeholder="Update your comment..."
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleCommentEdit(editingCommentId)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-dark rounded-xl transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowComments;
