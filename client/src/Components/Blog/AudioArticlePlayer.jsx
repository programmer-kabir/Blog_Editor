import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  LuPlay,
  LuPause,
  LuSquare,
  LuVolume2,
  LuVolumeX,
  LuSparkles,
  LuGauge,
  LuMic,
} from "react-icons/lu";

const speeds = [1, 1.25, 1.5, 1.75, 2];

// Helper to identify voice gender / character for clear display
const getVoiceBadge = (voiceName = "") => {
  const lower = voiceName.toLowerCase();
  if (
    lower.includes("female") ||
    lower.includes("zira") ||
    lower.includes("susan") ||
    lower.includes("hazel") ||
    lower.includes("samantha") ||
    lower.includes("victoria") ||
    lower.includes("karen") ||
    lower.includes("eva") ||
    lower.includes("jenny") ||
    lower.includes("aria")
  ) {
    return "👩 Female";
  }
  if (
    lower.includes("male") ||
    lower.includes("david") ||
    lower.includes("george") ||
    lower.includes("mark") ||
    lower.includes("guy") ||
    lower.includes("daniel") ||
    lower.includes("james")
  ) {
    return "👨 Male";
  }
  return "🎙️ Narrator";
};

const AudioArticlePlayer = ({ title = "", htmlContent = "" }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");

  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        // Filter primarily to English voices for smooth article reading
        const englishVoices = availableVoices.filter((v) =>
          v.lang.toLowerCase().startsWith("en")
        );
        const voiceList = englishVoices.length > 0 ? englishVoices : availableVoices;
        setVoices(voiceList);

        // Check if user previously saved a preference
        const savedVoiceURI = localStorage.getItem("blog_audio_voice_uri");
        const matchingSaved = voiceList.find((v) => v.voiceURI === savedVoiceURI);

        if (matchingSaved) {
          setSelectedVoiceURI(matchingSaved.voiceURI);
        } else if (voiceList.length > 0) {
          // Default to a natural or Google female/male voice if available
          const preferred =
            voiceList.find(
              (v) =>
                v.name.includes("Google") ||
                v.name.includes("Natural") ||
                v.name.includes("Zira")
            ) || voiceList[0];
          setSelectedVoiceURI(preferred.voiceURI);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const selectedVoice = useMemo(() => {
    return voices.find((v) => v.voiceURI === selectedVoiceURI) || voices[0] || null;
  }, [voices, selectedVoiceURI]);

  // Strip HTML tags to get clean pronounceable text
  const getPlainText = () => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    return `${title}. ${text.replace(/\s+/g, " ").trim()}`;
  };

  const speakText = (rate = speed, voice = selectedVoice) => {
    window.speechSynthesis.cancel();

    const plainText = getPlainText();
    if (!plainText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = rate;
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePlay = () => {
    if (!isSupported) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    speakText(speed, selectedVoice);
  };

  const handlePause = () => {
    if (!isSupported) return;
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleSpeedChange = () => {
    const nextIndex = (speeds.indexOf(speed) + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    setSpeed(newSpeed);

    if (isPlaying) {
      speakText(newSpeed, selectedVoice);
    }
  };

  const handleVoiceChange = (e) => {
    const newURI = e.target.value;
    setSelectedVoiceURI(newURI);
    localStorage.setItem("blog_audio_voice_uri", newURI);

    const newVoice = voices.find((v) => v.voiceURI === newURI);
    if (isPlaying) {
      speakText(speed, newVoice);
    }
  };

  if (!isSupported) return null;

  return (
    <div className="my-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Player Info & Pulse animation */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/20 border border-brand/30 flex items-center justify-center text-brand flex-shrink-0">
            {isPlaying ? (
              <LuVolume2 className="text-lg animate-pulse" />
            ) : isPaused ? (
              <LuVolumeX className="text-lg text-amber-400" />
            ) : (
              <LuSparkles className="text-lg" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand">
                Audio Reader
              </span>
              {isPlaying && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Playing Story
                </span>
              )}
              {isPaused && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Paused
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              {isPlaying
                ? `Narrating with ${selectedVoice?.name || "AI Voice"}`
                : "Listen to this story narrated out loud"}
            </p>
          </div>
        </div>

        {/* Right: Controls, Voice Selector & Speed */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Voice Selector Dropdown (Male / Female / Regional) */}
          {voices.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
              <LuMic className="text-brand text-xs flex-shrink-0" />
              <select
                value={selectedVoiceURI}
                onChange={handleVoiceChange}
                className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer max-w-[180px] sm:max-w-[210px] truncate"
                title="Select Voice (Male / Female)"
              >
                {voices.map((v) => {
                  const badge = getVoiceBadge(v.name);
                  // Clean voice name
                  const cleanName = v.name
                    .replace(/Microsoft|Google|Desktop|English/g, "")
                    .replace(/[-()]/g, "")
                    .trim();
                  return (
                    <option
                      key={v.voiceURI}
                      value={v.voiceURI}
                      className="bg-slate-900 text-white"
                    >
                      {badge}: {cleanName || v.name}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Play / Resume Button */}
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-dark transition-all duration-200 shadow-sm hover:shadow-brand active:scale-95"
            >
              <LuPlay className="text-sm fill-white" />
              <span>{isPaused ? "Resume" : "Listen Now"}</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 transition-all active:scale-95 shadow-sm"
            >
              <LuPause className="text-sm fill-slate-900" />
              <span>Pause</span>
            </button>
          )}

          {/* Stop Button */}
          {(isPlaying || isPaused) && (
            <button
              onClick={handleStop}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Stop playback"
            >
              <LuSquare className="text-sm fill-current" />
            </button>
          )}

          {/* Speed Selector Toggle */}
          <button
            onClick={handleSpeedChange}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Adjust listening speed"
          >
            <LuGauge className="text-xs text-brand" />
            <span>{speed}x</span>
          </button>
        </div>

      </div>

      {/* Visual audio wave effect when playing */}
      {isPlaying && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center gap-1 justify-center h-4">
          {[40, 70, 95, 60, 85, 45, 90, 75, 55, 100, 65, 80, 50, 90, 70].map(
            (height, i) => (
              <span
                key={i}
                className="w-1 bg-brand rounded-full animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDelay: `${(i % 5) * 120}ms`,
                  animationDuration: "800ms",
                }}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default AudioArticlePlayer;
