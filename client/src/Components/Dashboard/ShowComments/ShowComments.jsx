import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchComments } from "../../../Pages/Redux/Comments/commentSlice";
import useAuth from "../../Hooks/useAuth";
import axios from "axios";
import toast from "react-hot-toast";
import { LuMessageSquare, LuPencil, LuTrash2, LuX } from "react-icons/lu";

const ShowComments = ({ id }) => {
  const { user } = useAuth();
  const { Comments = [] } = useSelector((state) => state.Comments);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchComments());
  }, [dispatch, id]);

  const currentComments = Comments.find((comment) => comment.blogId === id);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");

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
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/comments`, data);
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
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/comments`, { data });
      toast.success(response?.data?.message || "Comment deleted");
      dispatch(fetchComments());
    } catch (error) {
      toast.error("Error deleting comment");
    }
  };

  const commentList = currentComments?.comments || [];

  return (
    <div className="mt-8 pt-8 border-t border-slate-150">
      <div className="flex items-center gap-2 mb-6">
        <LuMessageSquare className="text-brand text-lg" />
        <h3 className="text-lg font-bold text-slate-900">
          Discussion ({commentList.length})
        </h3>
      </div>

      {commentList.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200/80">
          <p className="text-sm text-slate-500">
            No comments yet. Join the conversation and share your thoughts below!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {commentList.map((c) => (
            <div
              key={c.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                {c.image ? (
                  <img
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0"
                    src={c.image}
                    alt={c.name || "User"}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-light text-brand font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {(c.name || c.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{c.name || "Reader"}</span>
                    {c.email === user?.email && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-light text-brand">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {c.comment}
                  </p>
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
          ))}
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
