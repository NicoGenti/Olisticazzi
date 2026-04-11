"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import aphorisms from "@/data/aphorisms_seed.json";
import { getDailyAphorism } from "@/services/aphorismSelector";
import type { AphorismEntry } from "@/types/oracle";

export function EcoDelGiorno() {
  const entry = getDailyAphorism(new Date(), aphorisms as AphorismEntry[]);
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.clientHeight + 1);
    }
  }, [entry?.text]);

  if (!entry) return null;

  return (
    <button
      type="button"
      onClick={() => isTruncated && setExpanded((prev) => !prev)}
      className="glass rounded-2xl p-5 w-full text-left"
      style={{
        cursor: isTruncated ? "pointer" : "default",
        background:
          "linear-gradient(135deg, rgba(139,92,246,0.10) 0%, rgba(6,182,212,0.06) 100%)",
        border: "1px solid rgba(139,92,246,0.18)",
      }}
      aria-expanded={isTruncated ? expanded : undefined}
      aria-label="Eco del Giorno — aforisma quotidiano"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg" aria-hidden>
          🌿
        </span>
        <span
          className="text-xs font-semibold uppercase tracking-[0.14em]"
          style={{ color: "rgba(245,247,255,0.50)" }}
        >
          Eco del Giorno
        </span>
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
            className={`text-sm leading-relaxed italic ${
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
          style={{ color: "rgba(139,92,246,0.6)" }}
        >
          Tocca per leggere tutto
        </p>
      )}
    </button>
  );
}
