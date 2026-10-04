import React, { useEffect, useRef, useState } from "react";
import { DESIGNS, currentDesignId, goToDesign } from "../../data/designs";

interface DesignMenuProps {
  className?: string;
}

const DesignMenu: React.FC<DesignMenuProps> = ({ className = "" }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    rootRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    const next = e.key === "ArrowDown" ? i + 1 : i - 1;
    items[(next + items.length) % items.length]?.focus();
  };

  const current = open ? currentDesignId(window.location.hash) : "";

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-8 items-center gap-1 rounded-full border border-black/10 bg-white/80 px-3 text-xs font-medium text-neutral-800 backdrop-blur transition-colors hover:bg-white dark:border-white/15 dark:bg-black/70 dark:text-neutral-100 dark:hover:bg-black"
      >
        Designs
        <span aria-hidden className={`text-[9px] transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && (
        <div
          role="menu"
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 top-full z-[1100] mt-2 min-w-[11rem] rounded-xl border border-black/10 bg-white/80 p-1 shadow-lg backdrop-blur-xl dark:border-white/15 dark:bg-black/70"
        >
          {DESIGNS.map((d) => (
            <button
              key={d.id}
              type="button"
              role="menuitem"
              aria-current={d.id === current ? "page" : undefined}
              onClick={() => {
                setOpen(false);
                goToDesign(d.hash);
              }}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-left text-sm text-neutral-800 transition-colors hover:bg-black/5 focus:bg-black/5 focus:outline-none dark:text-neutral-100 dark:hover:bg-white/10 dark:focus:bg-white/10"
            >
              <span>{d.note === "Home" ? `${d.label} (Home)` : d.label}</span>
              {d.id === current && <span aria-hidden>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DesignMenu;
