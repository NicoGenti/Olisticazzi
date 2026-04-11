"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styles from "./FilterBar.module.css";

const RANGES = [
  { label: "7 giorni", value: "7" },
  { label: "30 giorni", value: "30" },
  { label: "90 giorni", value: "90" },
  { label: "Tutto", value: "all" },
] as const;

type RangeValue = (typeof RANGES)[number]["value"];

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const current = (searchParams.get("range") ?? "7") as RangeValue;

  function handleSelect(value: RangeValue) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", value);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className={styles.bar} role="group" aria-label="Filtro periodo">
      {RANGES.map((opt) => {
        const active = current === opt.value;
        return (
          <button
            key={opt.value}
            className={`${styles.pill} ${active ? styles.pillActive : ""}`}
            onClick={() => handleSelect(opt.value)}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
