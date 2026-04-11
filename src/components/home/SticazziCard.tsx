"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import sticazzi from "@/data/sticazzi_seed.json";
import { getDailySticazzi } from "@/services/sticazziSelector";
import { useSticazziEnabled } from "@/hooks/useSettings";
import { isFavorite, addFavorite, removeFavorite } from "@/services/db";
import type { SticazziEntry } from "@/types/oracle";

export function SticazziCard() {
  const enabled = useSticazziEnabled();
  const entry = getDailySticazzi(new Date(), sticazzi as SticazziEntry[]);
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [animating, setAnimating] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.clientHeight + 1);
    }
  }, [entry?.text]);

  useEffect(() => {
    if (!entry) return;
    isFavorite("sticazzi", entry.id).then(setFavorited);
  }, [entry]);

  if (!enabled || !entry) return null;

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimating(true);
    if (favorited) {
      await removeFavorite("sticazzi", entry.id);
      setFavorited(false);
    } else {
      await addFavorite("sticazzi", entry.id);
      setFavorited(true);
    }
    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <button
      type="button"
      onClick={() => isTruncated && setExpanded((prev) => !prev)}
      className="glass rounded-2xl p-5 w-full text-left relative"
      style={{
        cursor: isTruncated ? "pointer" : "default",
        background:
          "linear-gradient(135deg, rgba(251,146,60,0.12) 0%, rgba(234,88,12,0.06) 100%)",
        border: "1px solid rgba(251,146,60,0.22)",
      }}
      aria-expanded={isTruncated ? expanded : undefined}
      aria-label="Sticazzi — frase ironica quotidiana"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden>
            🎲
          </span>
          <span
            className="text-xs font-semibold uppercase tracking-[0.14em]"
            style={{ color: "rgba(245,247,255,0.50)" }}
          >
            Sticazzi
          </span>
        </div>

        <motion.button
          type="button"
          onClick={handleFavoriteToggle}
          animate={animating ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          aria-label={favorited ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
          style={{
            background: "none",
            border: "none",
            padding: "4px",
            cursor: "pointer",
            color: favorited ? "var(--accent-pink)" : "rgba(245,247,255,0.40)",
            fontSize: "1.25rem",
            lineHeight: 1,
          }}
        >
          {favorited ? "♥" : "♡"}
        </motion.button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={expanded ? "expanded" : "collapsed"}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <p
            ref={!expanded ? textRef : undefined}
            className={`text-sm leading-relaxed ${
              !expanded ? "line-clamp-2" : ""
            }`}
            style={{ color: "rgba(245,247,255,0.75)" }}
          >
            &ldquo;{entry.text}&rdquo;
          </p>
        </motion.div>
      </AnimatePresence>

      {isTruncated && !expanded && (
        <p
          className="text-xs mt-2"
          style={{ color: "rgba(251,146,60,0.6)" }}
        >
          Tocca per leggere tutto
        </p>
      )}
    </button>
  );
}