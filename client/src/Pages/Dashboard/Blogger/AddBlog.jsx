import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import JoditEditor from "jodit-react";
import { Link, useNavigate } from "react-router-dom";
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
  LuCheck,
  LuLayers,
  LuClock,
  LuCheckCircle2,
  LuAlertCircle,
  LuTag,
  LuPlus,
  LuCloud,
  LuSave,
  LuRotateCcw,
  LuTrash2,
  LuSparkles,
  LuBookOpen,
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

const AddBlog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const editor = useRef(null);
  const dispatch = useDispatch();

  const { categories: serverCategories = [] } = useSelector(
    (state) => state.Categories
  );

  useEffect(() => {
    if (serverCategories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, serverCategories.length]);

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

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const [saveStatus, setSaveStatus] = useState("idle"); // 'idle' | 'saving' | 'saved' | 'error'
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [detectedDraft, setDetectedDraft] = useState(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // Series & Collection State
  const [isSeries, setIsSeries] = useState(false);
  const [seriesName, setSeriesName] = useState("");
  const [seriesPart, setSeriesPart] = useState(1);
  const [availableSeries, setAvailableSeries] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/series`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setAvailableSeries(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
    },
  });

  const currentTitle = watch("title");

  // Save Draft Logic (Hybrid: LocalStorage + Backend Cloud)
  const saveDraft = useCallback(
    async (manual = false) => {
      if (!user?.email) return;
      const titleVal = watch("title");
      const hasContent =
        content && content.trim() !== "<p><br></p>" && content.trim() !== "";
      const hasTitle = titleVal && titleVal.trim() !== "";

      if (!hasTitle && !hasContent) {
        if (manual) toast.error("Write a title or content before saving draft");
        return;
      }

      setIsSavingDraft(true);
      setSaveStatus("saving");

      const draftPayload = {
        email: user.email,
        title: titleVal || "",
        category: selectedCategory,
        tags,
        content: content || "",
        previewImage,
        series:
          isSeries && seriesName.trim()
            ? { name: seriesName.trim(), part: Number(seriesPart) || 1 }
            : null,
        updatedAt: new Date().toISOString(),
      };

      try {
        // 1. Save to LocalStorage
        localStorage.setItem(
          `blogger_draft_${user.email}`,
          JSON.stringify(draftPayload)
        );

        // 2. Save to Cloud Backend
        await axios.put(
          `${import.meta.env.VITE_API_URL}/drafts`,
          draftPayload
        );

        const timeStr = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        setSaveStatus("saved");
        setLastSavedTime(timeStr);

        if (manual) {
          toast.success("Draft saved to cloud & local storage! 💾");
        }
      } catch (err) {
        console.error("Auto-save error:", err);
        setSaveStatus("error");
        if (manual) {
          toast.error("Cloud save failed. Saved locally.");
        }
      } finally {
        setIsSavingDraft(false);
      }
    },
    [user?.email, watch, content, selectedCategory, tags, previewImage, isSeries, seriesName, seriesPart]
  );

  // Auto-Save background timer: every 30 seconds
  useEffect(() => {
    if (!user?.email) return;

    const interval = setInterval(() => {
      const titleVal = watch("title");
      const hasContent =
        content && content.trim() !== "<p><br></p>" && content.trim() !== "";
      const hasTitle = titleVal && titleVal.trim() !== "";

      if (hasTitle || hasContent) {
        saveDraft(false);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [saveDraft, user?.email, watch, content]);

  // Check for unsaved draft on mount
  useEffect(() => {
    if (!user?.email) return;

    const checkDraft = async () => {
      try {
        let localDraft = null;
        const localRaw = localStorage.getItem(`blogger_draft_${user.email}`);
        if (localRaw) {
          try {
            localDraft = JSON.parse(localRaw);
          } catch (e) {}
        }

        let cloudDraft = null;
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/drafts?email=${encodeURIComponent(
              user.email
            )}`
          );
          cloudDraft = res.data?.draft;
        } catch (e) {}

        let bestDraft = null;
        if (localDraft && cloudDraft) {
          const localTime = new Date(localDraft.updatedAt || 0).getTime();
          const cloudTime = new Date(cloudDraft.updatedAt || 0).getTime();
          bestDraft = localTime >= cloudTime ? localDraft : cloudDraft;
        } else {
          bestDraft = localDraft || cloudDraft;
        }

        if (
          bestDraft &&
          (bestDraft.title?.trim() ||
            (bestDraft.content && bestDraft.content !== "<p><br></p>"))
        ) {
          setDetectedDraft(bestDraft);
          setShowRecoveryModal(true);
        }
      } catch (err) {
        console.error("Failed to check draft:", err);
      }
    };

    checkDraft();
  }, [user?.email]);

  // Restore Draft Action
  const handleRestoreDraft = () => {
    if (!detectedDraft) return;

    if (detectedDraft.title) {
      setValue("title", detectedDraft.title);
    }
    if (detectedDraft.content) {
      setContent(detectedDraft.content);
    }
    if (detectedDraft.category) {
      const match =
        activeCategories.find((c) => c.id === detectedDraft.category.id) ||
        detectedDraft.category;
      setSelectedCategory(match);
    }
    if (Array.isArray(detectedDraft.tags)) {
      setTags(detectedDraft.tags);
    }
    if (detectedDraft.previewImage) {
      setPreviewImage(detectedDraft.previewImage);
    }
    if (detectedDraft.series?.name) {
      setIsSeries(true);
      setSeriesName(detectedDraft.series.name);
      setSeriesPart(detectedDraft.series.part || 1);
    }

    setShowRecoveryModal(false);
    toast.success("Draft restored to editor! ✨");
  };

  // Discard Draft Action
  const handleDiscardDraft = async () => {
    if (user?.email) {
      localStorage.removeItem(`blogger_draft_${user.email}`);
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/drafts?email=${encodeURIComponent(
            user.email
          )}`
        );
      } catch (err) {}
    }
    setDetectedDraft(null);
    setShowRecoveryModal(false);
    toast("Draft discarded. Starting fresh canvas.");
  };

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
      placeholder:
        "Write your story here... format headings, add code blocks, quotes, and links...",
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

  const handleAddTag = (tagToAdd) => {
    const raw = typeof tagToAdd === "string" ? tagToAdd : tagInput;
    const clean = raw
      .trim()
      .toLowerCase()
      .replace(/^#+/, "")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!clean) return;

    if (tags.includes(clean)) {
      toast.error(`Tag #${clean} is already added`);
      setTagInput("");
      return;
    }

    if (tags.length >= 6) {
      toast.error("You can add up to 6 tags per story");
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

  const handleRemoveTag = (tagToRemove) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const onSubmit = async (data) => {
    if (!data.title?.trim()) {
      toast.error("Please enter a story title");
      return;
    }

    if (!selectedCategory) {
      toast.error("Please choose a category in the right sidebar");
      return;
    }

    if (!imageFile) {
      toast.error("Please upload a featured cover image in the right sidebar");
      return;
    }

    if (!content.trim() || content === "<p><br></p>") {
      toast.error("Please write some content before publishing");
      return;
    }

    setIsPublishing(true);
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
    const imgbbKey =
      import.meta.env.VITE_IMGBB_API_KEY || "f1e08dc7c44c396aa409d50dfcc797da";
    const uploadUrl = `https://api.imgbb.com/1/upload?key=${imgbbKey}`;

    try {
      // 1. Upload Cover Image to ImgBB
      const formData = new FormData();
      formData.append("image", imageFile);

      const imgRes = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });
      const imgJson = await imgRes.json();
      const photoUrl = imgJson?.data?.display_url;

      if (!photoUrl) {
        throw new Error(
          "Failed to upload cover photo. Please try a different image."
        );
      }

      // 2. Prepare Blog Payload
      const blogPayload = {
        title: data.title.trim(),
        category: selectedCategory.id,
        tags:
          tags.length > 0
            ? tags
            : [selectedCategory.id.toLowerCase().replace(/[^a-z0-9-]/g, "-")],
        content: content,
        photo: photoUrl,
        date: today,
        email: user.email,
        status: "pending",
        series:
          isSeries && seriesName.trim()
            ? {
                name: seriesName.trim(),
                part: Number(seriesPart) || 1,
              }
            : null,
        like: {
          count: 0,
          email: [],
        },
      };

      // 3. Post to backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/blogs`,
        blogPayload
      );

      if (response.data?.insertedId) {
        // Clear saved drafts upon successful publishing
        if (user?.email) {
          localStorage.removeItem(`blogger_draft_${user.email}`);
          try {
            await axios.delete(
              `${import.meta.env.VITE_API_URL}/drafts?email=${encodeURIComponent(
                user.email
              )}`
            );
          } catch (de) {}
        }

        toast.success("Story submitted! Sent to editorial queue for approval.");
        navigate("../blogger/show-blog");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error?.message || "Failed to publish story");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Studio Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="../blogger"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Back to Studio"
          >
            <LuArrowLeft className="text-lg" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand">
                Creator Studio
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <LuClock className="text-xs" /> ~{readingTime} min read (
                {wordCount} words)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Draft New Story
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Auto-Save Status Indicator */}
          {saveStatus === "saving" ? (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold animate-pulse">
              <LuCloud className="text-sm" />
              <span>Saving draft...</span>
            </div>
          ) : lastSavedTime ? (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <LuCheckCircle2 className="text-sm" />
              <span>Saved to cloud at {lastSavedTime}</span>
            </div>
          ) : (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium">
              <LuCloud className="text-sm" />
              <span>Auto-save active (30s)</span>
            </div>
          )}

          {/* Manual Save Draft Button */}
          <button
            type="button"
            onClick={() => saveDraft(true)}
            disabled={isSavingDraft || isPublishing}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs hover:border-brand/40"
            title="Save draft immediately to cloud and local storage"
          >
            <LuSave className="text-sm text-brand" />
            <span>{isSavingDraft ? "Saving..." : "Save Draft"}</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isPublishing}
            id="submit-story-btn"
            className="px-6 py-2.5 rounded-full font-bold text-xs text-white bg-brand hover:bg-brand-dark transition-all duration-200 shadow-md hover:shadow-brand flex items-center gap-2 disabled:opacity-50"
          >
            {isPublishing ? "Publishing Story..." : "Submit for Approval"}
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Left Canvas, Right Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8-col: Content Canvas */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-6">
          {/* Story Title */}
          <div>
            <label
              htmlFor="title"
              className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2"
            >
              Story Title
            </label>
            <textarea
              id="title"
              rows={2}
              {...register("title", { required: "A title is required" })}
              placeholder="Title of your story..."
              className="w-full text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 placeholder:text-slate-300 border-none outline-none focus:ring-0 resize-none p-0 leading-tight bg-transparent"
            />
            {errors.title && (
              <p className="text-xs text-red-600 font-medium">
                {errors.title.message}
              </p>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Jodit Rich Text Editor */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Story Content & Narrative
            </label>
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

        {/* Right 4-col: Inspector Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Box 1: Publication Readiness */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Publishing Checklist
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                {selectedCategory ? (
                  <LuCheckCircle2 className="text-emerald-500 text-sm flex-shrink-0" />
                ) : (
                  <LuAlertCircle className="text-slate-300 text-sm flex-shrink-0" />
                )}
                <span
                  className={
                    selectedCategory
                      ? "text-slate-800 font-semibold"
                      : "text-slate-400"
                  }
                >
                  {selectedCategory
                    ? `Category: ${selectedCategory.label}`
                    : "Choose topic category"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {previewImage ? (
                  <LuCheckCircle2 className="text-emerald-500 text-sm flex-shrink-0" />
                ) : (
                  <LuAlertCircle className="text-slate-300 text-sm flex-shrink-0" />
                )}
                <span
                  className={
                    previewImage
                      ? "text-slate-800 font-semibold"
                      : "text-slate-400"
                  }
                >
                  {previewImage ? "Cover photo added" : "Upload cover photo"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {tags.length > 0 ? (
                  <LuCheckCircle2 className="text-emerald-500 text-sm flex-shrink-0" />
                ) : (
                  <LuAlertCircle className="text-slate-300 text-sm flex-shrink-0" />
                )}
                <span
                  className={
                    tags.length > 0
                      ? "text-slate-800 font-semibold"
                      : "text-slate-400"
                  }
                >
                  {tags.length > 0 ? `${tags.length} tag(s) assigned` : "Add relevant tags (optional)"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {wordCount > 15 ? (
                  <LuCheckCircle2 className="text-emerald-500 text-sm flex-shrink-0" />
                ) : (
                  <LuAlertCircle className="text-slate-300 text-sm flex-shrink-0" />
                )}
                <span
                  className={
                    wordCount > 15
                      ? "text-slate-800 font-semibold"
                      : "text-slate-400"
                  }
                >
                  {wordCount > 15
                    ? `${wordCount} words written`
                    : "Write story content"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isPublishing}
              className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-brand hover:bg-brand-dark transition-all duration-200 shadow-md hover:shadow-brand flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPublishing
                ? "Publishing Story..."
                : "Submit Story for Approval"}
            </button>
          </div>

          {/* Box 2: Featured Cover Image */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Featured Cover Photo
              </label>
              <span className="text-[10px] text-slate-400">16:9 Landscape</span>
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
                  title="Remove image"
                >
                  <LuX className="text-xs" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="cover-upload"
                className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand/50 bg-slate-50/60 hover:bg-brand-light/20 cursor-pointer transition-all text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl text-brand group-hover:scale-110 transition-transform mb-2">
                  <LuUploadCloud />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Click to choose cover photo
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  PNG, JPG, or WEBP up to 5MB
                </p>
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Box 3: Topic Category */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-3 relative">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Topic Category
            </label>

            <div
              id="category-dropdown-trigger" onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors"
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
                className={`text-slate-400 text-xs transition-transform ${
                  isCategoryOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isCategoryOpen && (
              <div className="absolute left-6 right-6 top-[80px] z-30 bg-white rounded-2xl border border-slate-200 shadow-elevated p-2 max-h-56 overflow-y-auto animate-in fade-in duration-150">
                {activeCategories.map((cat) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  return (
                    <div
                      key={cat.id}
                      id={`cat-option-${cat.id}`}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsCategoryOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-brand text-white font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>
                      {isSelected && <LuCheck className="text-xs" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Box 4: Article Tags (#hashtags) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <LuTag className="text-brand text-sm" />
                <span>Story Tags ({tags.length}/6)</span>
              </label>
              <span className="text-[10px] text-slate-400">Press Enter</span>
            </div>

            {/* Tag Input Field */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  #
                </span>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="react, tutorial, ai..."
                  disabled={tags.length >= 6}
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand placeholder:text-slate-400 bg-slate-50/50 disabled:opacity-50"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddTag()}
                disabled={!tagInput.trim() || tags.length >= 6}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-brand disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors flex items-center gap-1"
              >
                <LuPlus className="text-xs" />
                <span>Add</span>
              </button>
            </div>

            {/* Tag Chips */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-light text-brand border border-brand/20 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="p-0.5 rounded-full hover:bg-brand/20 text-brand transition-colors"
                      title="Remove tag"
                    >
                      <LuX className="text-[11px]" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick Suggestion Pills */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-semibold text-slate-400 block mb-1.5">
                Suggested tags:
              </span>
              <div className="flex flex-wrap gap-1">
                {["react", "javascript", "webdev", "ai", "cloud", "tutorial"]
                  .filter((st) => !tags.includes(st))
                  .slice(0, 4)
                  .map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleAddTag(st)}
                      disabled={tags.length >= 6}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-40"
                    >
                      +{st}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Box 4.5: Series & Collection */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <LuBookOpen className="text-brand text-sm" />
                <span>Series & Collection</span>
              </label>

              {/* Interactive Toggle Switch */}
              <button
                type="button"
                onClick={() => setIsSeries(!isSeries)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isSeries ? "bg-brand" : "bg-slate-200"
                }`}
                title="Toggle series membership"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isSeries ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-tight">
              Group multi-part tutorials or chapter guides into a coherent reader journey.
            </p>

            {isSeries && (
              <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Series Name / Title
                  </label>
                  <input
                    type="text"
                    value={seriesName}
                    onChange={(e) => setSeriesName(e.target.value)}
                    placeholder="e.g. Full-Stack React & Node Mastery"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-slate-50/50 placeholder:text-slate-400 font-medium"
                  />

                  {/* Existing Series Quick Picks if any */}
                  {availableSeries.length > 0 && (
                    <div className="mt-2.5">
                      <span className="text-[10px] font-medium text-slate-400 block mb-1">
                        Or pick an existing series:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {availableSeries.map((s) => (
                          <button
                            key={s.name}
                            type="button"
                            onClick={() => {
                              setSeriesName(s.name);
                              setSeriesPart((s.totalParts || 0) + 1);
                            }}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                              seriesName === s.name
                                ? "bg-brand text-white shadow-xs"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                          >
                            📚 {s.name} (Pt {s.totalParts + 1})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Chapter / Part Number
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={seriesPart}
                      onChange={(e) =>
                        setSeriesPart(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-20 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-slate-50/50 font-bold"
                    />
                    <span className="text-xs text-slate-500 font-medium">
                      Part {seriesPart} of this series
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Box 5: Author Info */}
          <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200/60 flex items-center gap-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-brand text-white font-bold text-xs flex items-center justify-center">
                {(user?.displayName || user?.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <div className="truncate text-xs">
              <span className="font-bold text-slate-900 block truncate">
                {user?.displayName || "Author"}
              </span>
              <span className="text-[10px] text-slate-500 truncate block">
                {user?.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Draft Recovery Modal */}
      {showRecoveryModal && detectedDraft && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-brand-light text-brand flex items-center justify-center text-2xl shadow-xs">
                  📝
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Unsaved Draft Detected!
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saved{" "}
                    {detectedDraft.updatedAt
                      ? new Date(detectedDraft.updatedAt).toLocaleDateString() +
                        " at " +
                        new Date(detectedDraft.updatedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "recently"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                Draft Preview
              </span>
              <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                {detectedDraft.title || "(Untitled Story Draft)"}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {(detectedDraft.content || "")
                  .replace(/<[^>]+>/g, " ")
                  .trim() || "No written body content."}
              </p>
              {detectedDraft.category && (
                <div className="pt-2 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-700">
                    {detectedDraft.category.icon} {detectedDraft.category.label}
                  </span>
                  {detectedDraft.tags?.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      #{detectedDraft.tags.join(" #")}
                    </span>
                  )}
                  {detectedDraft.series?.name && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-800">
                      📚 {detectedDraft.series.name} • Part {detectedDraft.series.part || 1}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <LuTrash2 className="text-sm" />
                <span>Discard & Start Fresh</span>
              </button>

              <button
                type="button"
                onClick={handleRestoreDraft}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-dark transition-all shadow-md hover:shadow-brand flex items-center justify-center gap-2"
              >
                <LuRotateCcw className="text-sm" />
                <span>Restore Draft</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBlog;
