import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../Redux/Categories/categorySlice";
import { fetchBlogs } from "../../Redux/Blogs/blogSlice";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  LuLayers,
  LuPlus,
  LuTrash2,
  LuSearch,
  LuSparkles,
  LuX,
  LuBookOpen,
} from "react-icons/lu";

const ManageCategories = () => {
  const dispatch = useDispatch();
  const { categories = [], isLoading } = useSelector(
    (state) => state.Categories
  );
  const { Blogs = [] } = useSelector((state) => state.Blogs);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newLabel, setNewLabel] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newIcon, setNewIcon] = useState("📌");
  const [newImage, setNewImage] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
    if (Blogs.length === 0) dispatch(fetchBlogs());
  }, [dispatch, Blogs.length]);

  // Auto-generate slug when typing label
  const handleLabelChange = (e) => {
    const val = e.target.value;
    setNewLabel(val);
    if (!newTitle || newTitle === newLabel.toLowerCase().replace(/\s+/g, "-")) {
      setNewTitle(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"));
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newLabel.trim() || !newTitle.trim()) {
      toast.error("Please provide both category label and slug title");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        label: newLabel.trim(),
        title: newTitle.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
        icon: newIcon.trim() || "📌",
        image:
          newImage.trim() ||
          "https://i.ibb.co/mGLLb3J/programming.png",
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/categories`,
        payload,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("access-token")}`,
          },
        }
      );

      if (res.data?.insertedId) {
        toast.success(`Category "${payload.label}" added successfully!`);
        setIsModalOpen(false);
        setNewLabel("");
        setNewTitle("");
        setNewIcon("📌");
        setNewImage("");
        dispatch(fetchCategories());
      }
    } catch (err) {
      console.error("Add category error:", err);
      toast.error(err.response?.data?.message || "Failed to add category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = (cat) => {
    Swal.fire({
      title: `Delete Category "${cat.label}"?`,
      text: "This category will be removed from the platform and authors won't be able to select it.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, Delete It",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(
            `${import.meta.env.VITE_API_URL}/categories/${cat._id}`,
            {
              headers: {
                authorization: `Bearer ${localStorage.getItem("access-token")}`,
              },
            }
          );
          if (res.data?.deletedCount) {
            toast.success(`Category "${cat.label}" deleted`);
            dispatch(fetchCategories());
          }
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to delete category");
        }
      }
    });
  };

  const displayedCategories = categories.filter(
    (c) =>
      c?.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Category Taxonomy & Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Create, manage, and delete article categories dynamically across the entire platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-brand hover:bg-brand-dark transition-all duration-200 shadow-md hover:shadow-brand flex-shrink-0"
        >
          <LuPlus className="text-base" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Search & Overview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories by name or slug..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white"
          />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
          <LuLayers className="text-brand" />
          <span>{categories.length} total active categories in database</span>
        </div>
      </div>

      {/* Categories Grid */}
      {displayedCategories.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white border border-slate-200/80 shadow-card space-y-3">
          <LuLayers className="text-3xl text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Categories Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchTerm
              ? `No categories match "${searchTerm}".`
              : "No categories currently exist. Click 'Add New Category' above to create one."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedCategories.map((cat) => {
            const articleCount = Blogs.filter(
              (b) => b?.category?.toLowerCase() === cat.title?.toLowerCase()
            ).length;

            return (
              <div
                key={cat._id}
                className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2.5 group-hover:bg-brand-light/40 transition-colors">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.label}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <span className="text-2xl">{cat.icon || "📌"}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete category"
                    >
                      <LuTrash2 className="text-base" />
                    </button>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-brand transition-colors">
                      {cat.label}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      slug: {cat.title}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <LuBookOpen className="text-brand text-xs" />
                    <span>{articleCount} published {articleCount === 1 ? "story" : "stories"}</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Category Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-elevated p-6 sm:p-8 border border-slate-150 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-light text-brand flex items-center justify-center">
                  <LuSparkles className="text-sm" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Add New Category
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Category Display Name
                </label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={handleLabelChange}
                  placeholder="e.g., Artificial Intelligence"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Category URL Slug
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., artificial-intelligence"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-mono text-xs focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
                <p className="text-[10px] text-slate-400">
                  Used in URL routing: /blogs/category/{newTitle || "slug"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Emoji Icon
                  </label>
                  <input
                    type="text"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    placeholder="🤖"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 text-center text-lg focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Icon Image URL
                  </label>
                  <input
                    type="url"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-dark rounded-xl transition-all shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;

