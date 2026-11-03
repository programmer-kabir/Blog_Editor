import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import JoditEditor from "jodit-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../Redux/Categories/categorySlice";
import useAuth from "../../../Components/Hooks/useAuth";
import "./AddBlog.css";
import { handleSmartPaste, cleanHtmlStyles } from "../../../utils/pasteFormatter";
import {
  LuUploadCloud,
  LuX,
  LuChevronDown,
  LuArrowLeft,
  LuCheckCircle2,
  LuAlertCircle,
  LuLayers,
  LuClock,
  LuSave,
  LuPenSquare,
  LuSparkles,
} from "react-icons/lu";

const fallbackCategories = [
  { id: "programming", label: "Programming & Code", icon: "💻" },
  { id: "technology", label: "Technology & Gadgets", icon: "⚡" },
  { id: "devops", label: "Cloud & DevOps", icon: "☁️" },
  { id: "travel", label: "Travel & Tours", icon: "✈️" },
  { id: "education", label: "Education & Learning", icon: "🎓" },
  { id: "lifestyle", label: "Lifestyle & Culture", icon: "🌿" },
  { id: "fitness", label: "Health & Fitness", icon: "💪" },
  { id: "fashion", label: "Fashion & Style", icon: "👗" },
  { id: "food", label: "Food & Culinary", icon: "🍔" },
];

const EditBlog = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const editor = useRef(null);
  const dispatch = useDispatch();

  const { categories: serverCategories = [] } = useSelector(
    (state) => state.Categories
  );

  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [originalPhoto, setOriginalPhoto] = useState(null);

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const activeCategories = useMemo(() => {
    if (serverCategories && serverCategories.length > 0) {
      return serverCategories.map((cat) => ({
        id: cat.title,
        label: cat.label,
        icon: cat.icon || "📌",
      }));
    }
    return fallbackCategories;
  }, [serverCategories]);

  // Load existing blog data
  useEffect(() => {
    if (serverCategories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, serverCategories.length]);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/blogs/${id}`)
      .then((res) => {
        const blog = res.data;
        if (!blog) {
          toast.error("Blog not found");
          navigate("../blogger/show-blog");
          return;
        }
        setValue("title", blog.title || "");
        setContent(blog.content || "");
        setTags(blog.tags || []);
        setPreviewImage(blog.photo || null);
        setOriginalPhoto(blog.photo || null);

        // Match category
        const matchedCat =
          fallbackCategories.find((c) => c.id === blog.category) ||
          (blog.category ? { id: blog.category, label: blog.category, icon: "📌" } : null);
        setSelectedCategory(matchedCat);
      })
      .catch(() => {
        toast.error("Failed to load blog");
        navigate("../blogger/show-blog");
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate, setValue]);

  const wordCount = useMemo(() => {
    const text = (content || "").replace(/<[^>]+>/g, " ").trim();
    return text ? text.split(/\s+/).filter(Boolean).length : 0;
  }, [content]);

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleFixColors = () => {
    if (!content) return;
    const cleaned = cleanHtmlStyles(content);
    setContent(cleaned);
    toast.success("Text styles & high-contrast colors restored! ✨");
  };

  const joditConfig = useMemo(
    () => ({
      readonly: false,
      placeholder: "Edit your story here...",
      minHeight: 520,
      toolbarAdaptive: false,
      style: {
        fontFamily: "inherit",
        fontSize: "16px",
        color: "#1e293b",
      },
      buttons: [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "ul",
        "ol",
        "|",
        "font",
        "fontsize",
        "paragraph",
        "|",
        "brush",
        "copyformat",
        "|",
        "image",
        "link",
        "table",
        "|",
        "align",
        "indent",
        "outdent",
        "|",
        "undo",
        "redo",
        "|",
        "hr",
        "eraser",
        "fullsize",
        "source",
      ],
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
    }),
    []
  );

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewImage(null);
    setImageFile(null);
  };

  const handleAddTag = () => {
    const clean = tagInput
      .trim()
      .toLowerCase()
      .replace(/^#+/, "")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (!clean) return;
    if (tags.includes(clean)) {
      toast.error(`Tag #${clean} already added`);
      setTagInput("");
      return;
    }
    if (tags.length >= 6) {
      toast.error("Max 6 tags allowed");
      return;
    }
    setTags((prev) => [...prev, clean]);
    setTagInput("");
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const onSubmit = async (data) => {
    if (!data.title?.trim()) {
      toast.error("Please enter a story title");
      return;
    }
    if (!selectedCategory) {
      toast.error("Please choose a category");
      return;
    }
    if (!content.trim() || content === "<p><br></p>") {
      toast.error("Please write some content");
      return;
    }

    setIsSaving(true);
    const imgbbKey =
      import.meta.env.VITE_IMGBB_API_KEY || "f1e08dc7c44c396aa409d50dfcc797da";

    try {
      let photoUrl = originalPhoto;

      // Upload new cover image if changed
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const imgRes = await fetch(
          `https://api.imgbb.com/1/upload?key=${imgbbKey}`,
          { method: "POST", body: formData }
        );
        const imgJson = await imgRes.json();
        photoUrl = imgJson?.data?.display_url;
        if (!photoUrl) throw new Error("Failed to upload new cover image");
      }

      const updatePayload = {
        title: data.title.trim(),
        category: selectedCategory.id,
        tags: tags.length > 0 ? tags : [selectedCategory.id],
        content,
        photo: photoUrl,
        status: "pending", // re-submit for review after edit
      };

      await axios.patch(
        `${import.meta.env.VITE_API_URL}/blogs/${id}`,
        updatePayload
      );

      toast.success("Blog updated! Re-submitted for approval.");
      navigate("../blogger/show-blog");
    } catch (error) {
      console.error("Edit error:", error);
      toast.error(error?.message || "Failed to update blog");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading blog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="../blogger/show-blog"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <LuArrowLeft className="text-lg" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand">
                Edit Story
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <LuClock className="text-xs" /> ~{readingTime} min read ({wordCount} words)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Edit & Resubmit
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-full font-bold text-xs text-white bg-brand hover:bg-brand-dark transition-all duration-200 shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <LuSave className="text-sm" />
            {isSaving ? "Saving..." : "Save & Resubmit"}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Editor */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Story Title
            </label>
            <textarea
              rows={2}
              {...register("title", { required: "A title is required" })}
              placeholder="Title of your story..."
              className="w-full text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 placeholder:text-slate-300 border-none outline-none focus:ring-0 resize-none p-0 leading-tight bg-transparent"
            />
            {errors.title && (
              <p className="text-xs text-red-600 font-medium">{errors.title.message}</p>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Jodit Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Story Content
              </label>
              <button
                type="button"
                onClick={handleFixColors}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold text-brand bg-brand-light hover:bg-brand/10 transition-colors border border-brand/20 cursor-pointer shadow-xs"
                title="Fix faint gray colors or clean formatting from pasted text"
              >
                <LuSparkles className="text-xs" />
                <span>Fix Faint Text / Restore Colors</span>
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 focus-within:border-brand/40 transition-colors">
              <JoditEditor
                ref={editor}
                value={content}
                config={joditConfig}
                tabIndex={1}
                onBlur={(newContent) => setContent(newContent)}
              />
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publishing Checklist */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Update Checklist
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                {selectedCategory ? (
                  <LuCheckCircle2 className="text-emerald-500 text-sm flex-shrink-0" />
                ) : (
                  <LuAlertCircle className="text-slate-300 text-sm flex-shrink-0" />
                )}
                <span className={selectedCategory ? "text-slate-800 font-semibold" : "text-slate-400"}>
                  {selectedCategory ? `Category: ${selectedCategory.label}` : "Choose category"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {previewImage ? (
                  <LuCheckCircle2 className="text-emerald-500 text-sm flex-shrink-0" />
                ) : (
                  <LuAlertCircle className="text-slate-300 text-sm flex-shrink-0" />
                )}
                <span className={previewImage ? "text-slate-800 font-semibold" : "text-slate-400"}>
                  {previewImage ? "Cover photo ready" : "Upload cover photo"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {wordCount > 15 ? (
                  <LuCheckCircle2 className="text-emerald-500 text-sm flex-shrink-0" />
                ) : (
                  <LuAlertCircle className="text-slate-300 text-sm flex-shrink-0" />
                )}
                <span className={wordCount > 15 ? "text-slate-800 font-semibold" : "text-slate-400"}>
                  {wordCount > 15 ? `${wordCount} words written` : "Write content"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
              className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-brand hover:bg-brand-dark transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LuPenSquare className="text-sm" />
              {isSaving ? "Saving Changes..." : "Save & Resubmit for Review"}
            </button>
          </div>

          {/* Cover Photo */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Cover Photo
              </label>
              <span className="text-[10px] text-slate-400">Change or keep current</span>
            </div>

            {previewImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-48 group">
                <img
                  src={previewImage}
                  alt="Cover Preview"
                  className="w-full h-44 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-brand transition-colors backdrop-blur-md"
                >
                  <LuX className="text-xs" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="edit-cover-upload"
                className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand/50 bg-slate-50/60 cursor-pointer transition-all text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl text-brand mb-2">
                  <LuUploadCloud />
                </div>
                <p className="text-xs font-bold text-slate-800">Click to upload new cover</p>
                <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB</p>
                <input
                  id="edit-cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Category */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-3 relative">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Topic Category
            </label>
            <div
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <LuLayers className="text-brand text-sm" />
                <span>
                  {selectedCategory
                    ? `${selectedCategory.icon} ${selectedCategory.label}`
                    : "Choose topic category..."}
                </span>
              </div>
              <LuChevronDown
                className={`text-slate-400 text-xs transition-transform ${isCategoryOpen ? "rotate-180" : ""}`}
              />
            </div>

            {isCategoryOpen && (
              <div className="absolute left-6 right-6 top-[80px] z-30 bg-white rounded-2xl border border-slate-200 shadow-elevated p-2 max-h-56 overflow-y-auto animate-in fade-in duration-150">
                {activeCategories.map((cat) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsCategoryOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-brand-light text-brand"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span>{cat.icon} {cat.label}</span>
                      {isSelected && <LuCheckCircle2 className="text-brand text-sm" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-light text-brand border border-brand/20"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                    className="text-brand/60 hover:text-brand ml-0.5"
                  >
                    <LuX className="text-xs" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tag, press Enter"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-dark transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBlog;

