"use client";

import { useState } from "react";

export interface SaveMoodButtonProps {
  onSave: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function SaveMoodButton({ onSave, disabled, className }: SaveMoodButtonProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (saving || disabled) {
      return;
    }

    setSaving(true);

    try {
      await onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), 1000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={disabled || saving}
      className={`h-14 w-full rounded-full border border-white/30 bg-gradient-to-r from-[#4fd1c5]/35 via-[#7c3aed]/35 to-[#ec4899]/35 px-5 font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,0.28)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55 ${className ?? ""}`}
    >
      {saving ? (
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
          Salvando...
        </span>
      ) : saved ? (
        "Salvato ✓"
      ) : (
        "Salva il tuo umore"
      )}
    </button>
  );
}
