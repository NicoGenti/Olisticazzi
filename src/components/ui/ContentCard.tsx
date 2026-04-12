"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FavoriteHeartIcon } from "@/components/layout/FavoriteHeartIcon";

interface ContentCardProps {
  icon: string;
  title: string;
  text: string;
  gradient: string;
  borderColor: string;
  accentColor: string;
  favorited: boolean;
  animating: boolean;
  onToggleFavorite: () => void;
  ariaLabel: string;
  italic?: boolean;
}

export function ContentCard({
  icon,
  title,
  text,
  gradient,
  borderColor,
  accentColor,
  favorited,
  animating,
  onToggleFavorite,
  ariaLabel,
  italic = false,
}: ContentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.clientHeight + 1);
    }
  }, [text]);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  return (
    <button
      type="button"
      onClick={() => isTruncated && setExpanded((prev) => !prev)}
      className="glass rounded-2xl p-5 w-full text-left"
      style={{
        cursor: isTruncated ? "pointer" : "default",
        background: gradient,
        border: `1px solid ${borderColor}`,
      }}
      aria-expanded={isTruncated ? expanded : undefined}
      aria-label={ariaLabel}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden>
            {icon}
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
            {title}
          </span>
        </div>

        <FavoriteHeartIcon
          favorited={favorited}
          animating={animating}
          onToggle={handleFavoriteToggle}
        />
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
            className={`text-sm leading-relaxed ${italic ? "italic" : ""} ${
              !expanded ? "line-clamp-2" : ""
            }`}
            style={{ color: "var(--text-light)" }}
          >
            &ldquo;{text}&rdquo;
          </p>
        </motion.div>
      </AnimatePresence>

      {isTruncated && !expanded && (
        <p className="text-xs mt-2" style={{ color: accentColor }}>
          Tocca per leggere tutto
        </p>
      )}
    </button>
  );
}
