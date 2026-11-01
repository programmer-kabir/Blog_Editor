import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogs } from "../../Redux/Blogs/blogSlice";
import { formatDate } from "../../../Components/DateFomate/DateFormate";
import TableSkeleton from "../../../Components/Loader/TableSkeleton";
import axios from "axios";
import toast from "react-hot-toast";
import {
  LuBookOpen,
  LuCheckCircle2,
  LuXCircle,
  LuEye,
  LuSearch,
  LuClock,
  LuChevronLeft,
  LuChevronRight,
  LuAlertCircle,
  LuX,
  LuSend,
} from "react-icons/lu";

const AdminBlogs = () => {
  const dispatch = useDispatch();
  const { isBlogLoading, Blogs = [] } = useSelector((state) => state.Blogs);

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  const approvedBlogs = Blogs.filter((b) => b.status === "approved");
  const pendingBlogs = Blogs.filter((b) => b.status === "pending");
  const rejectBlogs = Blogs.filter((b) => b.status === "reject");

  // Filter by status tab
  const statusFiltered = Blogs.filter((blog) => {
    if (activeFilter === "approved") return blog.status === "approved";
    if (activeFilter === "pending") return blog.status === "pending";
    if (activeFilter === "reject") return blog.status === "reject";
    return true;
  });

  // Filter by search query
  const displayedBlogs = statusFiltered.filter((blog) =>
    blog?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog?.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 8;
  const totalPages = Math.ceil(displayedBlogs.length / blogsPerPage) || 1;
  const indexOfLast = currentPage * blogsPerPage;
  const indexOfFirst = indexOfLast - blogsPerPage;
  const currentBlogs = displayedBlogs.slice(indexOfFirst, indexOfLast);

  const handleApprove = async (blogId) => {
    try {
      const data = { blogId, status: "approved" };
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/blogs`, data);
      if (response.data.modifiedCount === 1) {
        toast.success("Blog approved and published live!");
        dispatch(fetchBlogs());
      }
    } catch (err) {
      toast.error("Failed to approve blog");
    }
  };

  const openRejectModal = (blog) => {
    setSelectedBlog(blog);
    setRejectReason(blog.rejectReason || "");
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsProcessing(true);
    try {
      const data = {
        blogId: selectedBlog._id,
        status: "reject",
        rejectReason: rejectReason.trim(),
      };
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/blogs`, data);
      if (response.data.modifiedCount === 1) {
        toast.success("Blog marked as rejected with feedback sent to author");
        setShowRejectModal(false);
        dispatch(fetchBlogs());
      }
    } catch (err) {
      toast.error("Failed to submit rejection");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Editorial Moderation Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Review incoming submissions, approve quality stories, or return with editorial notes.
          </p>
        </div>

        {pendingBlogs.length > 0 && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{pendingBlogs.length} articles waiting for review</span>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 max-w-fit">
          <button
            type="button"
            onClick={() => { setActiveFilter("all"); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Stories ({Blogs.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveFilter("pending"); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "pending"
                ? "bg-white text-amber-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pending Review ({pendingBlogs.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveFilter("approved"); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "approved"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Approved ({approvedBlogs.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveFilter("reject"); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "reject"
                ? "bg-white text-rose-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Rejected ({rejectBlogs.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search by title, author, or category..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white"
          />
        </div>

      </div>

      {/* Moderation Table */}
      {isBlogLoading ? (
        <TableSkeleton rows={7} cols={6} />
      ) : displayedBlogs.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white border border-slate-200/80 shadow-card space-y-2">
          <LuBookOpen className="text-3xl text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Articles Found</h3>
          <p className="text-xs text-slate-500">
            {searchTerm
              ? `No articles match your query "${searchTerm}".`
              : "No stories currently match this filter tab."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Story & Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {currentBlogs.map((blog) => {
                  const isApproved = blog.status === "approved";
                  const isPending = blog.status === "pending";
                  const isRejected = blog.status === "reject";

                  return (
                    <tr key={blog._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Story & Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 max-w-sm">
                          {blog.photo ? (
                            <img
                              src={blog.photo}
                              alt=""
                              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0">
                              <LuBookOpen />
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              to={`/blogs/details/${blog._id}`}
                              className="font-bold text-slate-900 hover:text-brand transition-colors line-clamp-1 text-xs sm:text-sm"
                            >
                              {blog.title}
                            </Link>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              ID: {blog._id.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {blog.category}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <span className="block truncate max-w-[150px]">{blog.email}</span>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {blog.date || "Recent"}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <LuCheckCircle2 /> Approved
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Pending
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                            <LuXCircle /> Rejected
                          </span>
                        )}
                      </td>

                      {/* Moderation Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approve Button */}
                          {!isApproved && (
                            <button
                              onClick={() => handleApprove(blog._id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                              title="Approve Story"
                            >
                              <LuCheckCircle2 className="text-xs" />
                              <span>Approve</span>
                            </button>
                          )}

                          {/* Reject Button */}
                          {!isRejected && (
                            <button
                              onClick={() => openRejectModal(blog)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                              title="Reject with notes"
                            >
                              <LuXCircle className="text-xs" />
                              <span>Reject</span>
                            </button>
                          )}

                          {/* Preview Link */}
                          <Link
                            to={`/blogs/details/${blog._id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand hover:bg-slate-100 transition-colors"
                            title="Read Story"
                          >
                            <LuEye className="text-sm" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <span>
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, displayedBlogs.length)} of {displayedBlogs.length} articles
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <LuChevronLeft className="text-sm" />
              </button>
              <span className="font-bold text-slate-800">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <LuChevronRight className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal Dialog */}
      {showRejectModal && selectedBlog && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-elevated p-6 border border-slate-150 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <LuAlertCircle className="text-lg" />
                <h3 className="font-bold text-slate-900 text-base">
                  Reject Story Submission
                </h3>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Article:</p>
                <p className="text-sm font-bold text-slate-800 line-clamp-1">
                  {selectedBlog.title}
                </p>
                <p className="text-[11px] text-slate-400">Author: {selectedBlog.email}</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Feedback & Rejection Reason
                </label>
                <textarea
                  rows={4}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this article cannot be published (e.g. requires formatting, inappropriate cover photo, lacks references)..."
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  <LuSend className="text-xs" />
                  <span>{isProcessing ? "Rejecting..." : "Confirm Rejection"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
