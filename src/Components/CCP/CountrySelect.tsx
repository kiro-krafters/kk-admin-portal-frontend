import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, type Country } from "../../Utils/countries";
import { ChevronDown, SearchIconSmall } from "./icons";

type Props = {
  value: Country;
  onChange: (next: Country) => void;
};

export default function CountrySelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.replace("+", "").includes(q.replace("+", ""))
    );
  }, [query]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded px-1 py-1 hover:bg-connect-bg-alt"
        aria-label="Select country"
      >
        <span className="text-base leading-none">{value.flag}</span>
        <span className="text-xs font-medium text-connect-text-secondary">
          {value.dialCode}
        </span>
        <ChevronDown className="h-3 w-3 text-connect-blue" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-64 overflow-hidden rounded-md border border-connect-border bg-white shadow-lg">
          <div className="border-b border-connect-border p-2">
            <label className="relative block">
              <SearchIconSmall className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-connect-text-secondary" />
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country or code"
                className="w-full rounded border border-connect-border py-1 pl-7 pr-2 text-sm focus:border-connect-teal focus:outline-none"
              />
            </label>
          </div>
          <ul className="max-h-60 overflow-y-auto py-1 text-sm">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-xs text-connect-text-secondary">
                No matches
              </li>
            )}
            {filtered.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(c);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left hover:bg-connect-bg-alt ${
                    c.code === value.code
                      ? "bg-connect-teal-soft font-medium text-connect-teal-dark"
                      : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base leading-none">{c.flag}</span>
                    <span className="truncate">{c.name}</span>
                  </span>
                  <span className="text-xs text-connect-text-secondary">
                    {c.dialCode}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
