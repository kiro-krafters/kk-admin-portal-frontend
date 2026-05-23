import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "./icons";

type Props = {
  current: string;
  options: string[];
  onChange: (next: string) => void;
};

export default function StatusDropdown({ current, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const isAvailable = current.toLowerCase() === "available";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-500/60 bg-transparent px-3 py-1 text-sm text-white hover:bg-white/5"
      >
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            isAvailable ? "bg-emerald-400" : "bg-slate-400"
          }`}
        />
        <span className="font-medium">{current}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <ul className="absolute left-0 z-20 mt-2 w-44 overflow-hidden rounded-md border border-slate-200 bg-white py-1 text-sm text-slate-800 shadow-lg">
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                className="block w-full px-3 py-1.5 text-left hover:bg-slate-100"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
