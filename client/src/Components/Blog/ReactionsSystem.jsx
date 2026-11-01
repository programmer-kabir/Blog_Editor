import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import useAuth from "../Hooks/useAuth";
import toast from "react-hot-toast";

const REACTION_CONFIG = [
  {
    type: "claps",
    label: "Clap",
    emoji: "👏",
    activeEmoji: "👏",
    color: "from-amber-500 to-orange-500",
    bgActive: "bg-amber-50 border-amber-300 text-amber-700 shadow-amber-200/50",
    tooltip: "Applaud this story (Hold to clap up to 50x)",
  },
  {
    type: "love",
    label: "Love",
    emoji: "❤️",
    activeEmoji: "💖",
    color: "from-rose-500 to-pink-500",
    bgActive: "bg-rose-50 border-rose-300 text-rose-700 shadow-rose-200/50",
    tooltip: "Love this piece",
  },
  {
    type: "insightful",
    label: "Insightful",
    emoji: "💡",
    activeEmoji: "✨",
    color: "from-yellow-400 to-amber-500",
    bgActive: "bg-yellow-50 border-yellow-300 text-yellow-800 shadow-yellow-200/50",
    tooltip: "Thought-provoking & educational",
  },
  {
    type: "mindblown",
    label: "Mindblown",
    emoji: "🚀",
    activeEmoji: "💥",
    color: "from-purple-500 to-indigo-600",
    bgActive: "bg-purple-50 border-purple-300 text-purple-700 shadow-purple-200/50",
    tooltip: "Mind-blowing idea",
  },
];

// Pure Web Audio API Pop/Clap synth sound
const playPopSound = (pitch = 600) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    // Autoplay restrictions or unavailable
  }
};

const ReactionsSystem = ({ blogId, orientation = "horizontal" }) => {
  const { user } = useAuth();

  const [reactions, setReactions] = useState({
    claps: 0,
    love: 0,
    insightful: 0,
    mindblown: 0,
  });

  const [userReaction, setUserReaction] = useState({
    claps: 0,
    love: false,
    insightful: false,
    mindblown: false,
  });

  const [particles, setParticles] = useState([]);
  const [activeBubble, setActiveBubble] = useState(null); // Floating clap count bubble
  const [animatingType, setAnimatingType] = useState(null);

  // Debounce refs
  const clapBatchRef = useRef({ pendingCount: 0, timeoutId: null });
  const bubbleTimeoutRef = useRef(null);
  const holdIntervalRef = useRef(null);
  const holdTimeoutRef = useRef(null);
  const isHoldingRef = useRef(false);

  // Fetch current reactions from API
  const fetchReactions = useCallback(async () => {
    if (!blogId) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/blogs/${blogId}/reactions?email=${
          encodeURIComponent(user?.email || "")
        }`
      );
      if (res.data) {
        setReactions(res.data.reactions || {});
        setUserReaction(res.data.userReaction || {});
      }
    } catch (err) {
      console.error("Error fetching reactions:", err);
    }
  }, [blogId, user?.email]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      if (clapBatchRef.current.timeoutId) clearTimeout(clapBatchRef.current.timeoutId);
    };
  }, []);

  // Flush batched claps to backend
  const flushClapsToBackend = async (countToSubmit) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/blogs/react`, {
        blogId,
        email: user?.email,
        userName: user?.displayName || user?.name || "A Reader",
        userImage: user?.photoURL || "",
        reactionType: "claps",
        count: countToSubmit,
      });
    } catch (err) {
      console.error("Failed to sync claps:", err);
    }
  };

  // Spawn confetti burst particles
  const spawnConfetti = (type) => {
    const count = type === "claps" ? 6 : 8;
    const emojis = {
      claps: ["✨", "👏", "🎉", "💛", "⭐"],
      love: ["❤️", "💖", "💕", "✨", "🌸"],
      insightful: ["💡", "✨", "🧠", "🌟", "⚡"],
      mindblown: ["🚀", "💥", "🌌", "🔥", "✨"],
    }[type] || ["✨"];

    const newParticles = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
      const distance = 35 + Math.random() * 35;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - 25; // upward lift
      newParticles.push({
        id: Date.now() + Math.random(),
        dx,
        dy,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        rotation: (Math.random() - 0.5) * 60,
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.slice(newParticles.length));
    }, 850);
  };

  // Perform a single Clap increment
  const handleClapStep = useCallback(() => {
    if (!user?.email) {
      toast.error("Please sign in to applaud this story");
      return false;
    }

    let reachedMax = false;

    setUserReaction((prev) => {
      const current = prev.claps || 0;
      if (current >= 50) {
        reachedMax = true;
        return prev;
      }
      const next = current + 1;

      // Update floating bubble
      setActiveBubble(next);
      if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
      bubbleTimeoutRef.current = setTimeout(() => {
        setActiveBubble(null);
      }, 1000);

      return { ...prev, claps: next };
    });

    if (reachedMax) {
      toast("Maximum 50 claps reached for this article! 👏", { icon: "🌟" });
      stopClapHold();
      return false;
    }

    // Increment overall reactions count
    setReactions((prev) => ({ ...prev, claps: (prev.claps || 0) + 1 }));

    // Sound effect with progressive pitch
    playPopSound(500 + Math.min(300, (userReaction.claps || 0) * 8));

    // Particle burst
    spawnConfetti("claps");
    setAnimatingType("claps");
    setTimeout(() => setAnimatingType(null), 250);

    // Queue for debounced backend sync
    clapBatchRef.current.pendingCount += 1;
    if (clapBatchRef.current.timeoutId) {
      clearTimeout(clapBatchRef.current.timeoutId);
    }
    clapBatchRef.current.timeoutId = setTimeout(() => {
      const toSend = clapBatchRef.current.pendingCount;
      clapBatchRef.current.pendingCount = 0;
      flushClapsToBackend(toSend);
    }, 450);

    return true;
  }, [user?.email, userReaction.claps]);

  // Hold-to-clap mouse/touch listeners
  const startClapHold = (e) => {
    e.preventDefault();
    if (isHoldingRef.current) return;
    isHoldingRef.current = true;

    // Trigger immediate first clap
    const ok = handleClapStep();
    if (!ok) return;

    // After 300ms hold, accelerate claps
    holdTimeoutRef.current = setTimeout(() => {
      holdIntervalRef.current = setInterval(() => {
        if (!handleClapStep()) {
          stopClapHold();
        }
      }, 130);
    }, 320);
  };

  const stopClapHold = () => {
    isHoldingRef.current = false;
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
  };

  // Handle boolean toggle reactions (Love, Insightful, Mindblown)
  const handleToggleReaction = async (type) => {
    if (!user?.email) {
      toast.error("Please sign in to react to this story");
      return;
    }

    setAnimatingType(type);
    setTimeout(() => setAnimatingType(null), 300);

    const isCurrentlyActive = !!userReaction[type];
    const nextActiveState = !isCurrentlyActive;

    // Optimistic update
    setUserReaction((prev) => ({ ...prev, [type]: nextActiveState }));
    setReactions((prev) => ({
      ...prev,
      [type]: Math.max(0, (prev[type] || 0) + (nextActiveState ? 1 : -1)),
    }));

    if (nextActiveState) {
      spawnConfetti(type);
      playPopSound(type === "love" ? 650 : type === "insightful" ? 750 : 850);
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/blogs/react`, {
        blogId,
        email: user.email,
        userName: user.displayName || user.name || "A Reader",
        userImage: user.photoURL || "",
        reactionType: type,
      });
    } catch (err) {
      // Revert on failure
      setUserReaction((prev) => ({ ...prev, [type]: isCurrentlyActive }));
      setReactions((prev) => ({
        ...prev,
        [type]: Math.max(0, (prev[type] || 0) + (isCurrentlyActive ? 1 : -1)),
      }));
      toast.error("Failed to update reaction");
    }
  };

  const isVertical = orientation === "vertical";

  return (
    <div
      className={`relative select-none ${
        isVertical
          ? "flex flex-col items-center gap-3 p-2 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-lg shadow-slate-200/50"
          : "flex flex-wrap items-center gap-3 p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/80"
      }`}
    >
      {/* 1. Confetti Burst Particle Canvas */}
      <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center z-30">
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              "--rot": `${p.rotation}deg`,
            }}
            className="absolute text-sm pointer-events-none animate-confetti-burst"
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* 2. Floating Medium-Style Clap Badge (+X / 50) */}
      {activeBubble !== null && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-amber-300 px-3 py-1 rounded-full text-xs font-black shadow-xl shadow-amber-500/20 flex items-center gap-1.5 animate-bounce-subtle pointer-events-none">
          <span>👏</span>
          <span>+{activeBubble}</span>
          <span className="text-[10px] text-slate-400 font-semibold">/50</span>
        </div>
      )}

      {/* 3. Reaction Buttons */}
      {REACTION_CONFIG.map((item) => {
        const isClap = item.type === "claps";
        const isActive = isClap
          ? userReaction.claps > 0
          : !!userReaction[item.type];
        const count = reactions[item.type] || 0;
        const isBouncing = animatingType === item.type;

        if (isClap) {
          return (
            <button
              key={item.type}
              onMouseDown={startClapHold}
              onMouseUp={stopClapHold}
              onMouseLeave={stopClapHold}
              onTouchStart={startClapHold}
              onTouchEnd={stopClapHold}
              title={item.tooltip}
              className={`group relative flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer select-none ${
                isVertical
                  ? "flex-col p-2 w-12 h-14 rounded-xl"
                  : "px-4 py-2.5 rounded-xl"
              } ${
                isActive
                  ? `${item.bgActive} border-2 shadow-sm shadow-amber-200/60`
                  : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80"
              }`}
            >
              <span
                className={`text-xl transition-transform duration-200 ${
                  isBouncing
                    ? "scale-125 -rotate-12"
                    : "group-hover:scale-115 group-hover:rotate-6"
                }`}
              >
                {isActive ? item.activeEmoji : item.emoji}
              </span>

              <span
                className={`font-black transition-colors ${
                  isVertical ? "text-[11px] mt-0.5" : "text-xs ml-2"
                } ${isActive ? "text-amber-800" : "text-slate-600"}`}
              >
                {count}
              </span>

              {/* Claps Progress Subtext for Horizontal Layout */}
              {userReaction.claps > 0 && !isVertical && (
                <span className="ml-1.5 text-[10px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded-md">
                  {userReaction.claps} claps
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={item.type}
            onClick={() => handleToggleReaction(item.type)}
            title={item.tooltip}
            className={`group relative flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer ${
              isVertical
                ? "flex-col p-2 w-12 h-14 rounded-xl"
                : "px-3.5 py-2.5 rounded-xl"
            } ${
              isActive
                ? `${item.bgActive} border shadow-sm`
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80"
            }`}
          >
            <span
              className={`text-xl transition-transform duration-200 ${
                isBouncing
                  ? "scale-125 -translate-y-1"
                  : "group-hover:scale-115"
              }`}
            >
              {isActive ? item.activeEmoji : item.emoji}
            </span>

            <span
              className={`font-bold transition-colors ${
                isVertical ? "text-[10px] mt-0.5" : "text-xs ml-2"
              } ${isActive ? "text-slate-900 font-black" : "text-slate-500"}`}
            >
              {count}
            </span>
          </button>
        );
      })}

      <style>{`
        @keyframes confettiBurst {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(0.6) rotate(0deg);
          }
          60% {
            opacity: 1;
            transform: translate(var(--dx), var(--dy)) scale(1.15) rotate(var(--rot));
          }
          100% {
            opacity: 0;
            transform: translate(calc(var(--dx) * 1.3), calc(var(--dy) - 15px)) scale(0.8) rotate(var(--rot));
          }
        }
        .animate-confetti-burst {
          animation: confettiBurst 0.8s cubic-bezier(0.12, 0.8, 0.3, 1) forwards;
        }

        @keyframes bounceSubtle {
          0%, 100% {
            transform: translate(-50%, 0) scale(1);
          }
          50% {
            transform: translate(-50%, -4px) scale(1.05);
          }
        }
        .animate-bounce-subtle {
          animation: bounceSubtle 0.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ReactionsSystem;
