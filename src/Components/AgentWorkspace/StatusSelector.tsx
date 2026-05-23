import { useEffect, useRef, useState } from "react";
import { useConnect } from "../../Utils/ConnectProvider";
import { ChevronDown } from "../CCP/icons";

const DEFAULT_STATES = ["Available", "Break", "Lunch", "Offline"];

const STATE_DOT: Record<string, string> = {
  Available: "bg-connect-success",
  Break: "bg-connect-warning",
  Lunch: "bg-connect-orange",
  Offline: "bg-connect-text-disabled",
};

export default function StatusSelector() {
  const { currentState, availableStates, changeState } = useConnect();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<string>(
    currentState?.name ?? "Offline"
  );

  useEffect(() => {
    if (currentState?.name) setSelected(currentState.name);
  }, [currentState?.name]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const options = (
    availableStates.length > 0
      ? availableStates.map((s) => s.name)
      : DEFAULT_STATES
  ).filter((s, i, arr) => arr.indexOf(s) === i);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-connect-border bg-white px-3 py-2 text-sm font-medium text-connect-text shadow-connect-card hover:border-connect-teal"
      >
        <span className="flex items-center gap-2">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              STATE_DOT[selected] ?? "bg-connect-text-disabled"
            }`}
          />
          <span>{selected}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-connect-text-secondary" />
      </button>

      {open && (
        <ul className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-md border border-connect-border bg-white shadow-lg">
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                  opt === selected
                    ? "bg-connect-teal-soft text-connect-teal-dark"
                    : "hover:bg-connect-bg-alt"
                }`}
                onClick={() => {
                  setSelected(opt);
                  changeState(opt);
                  setOpen(false);
                }}
              >
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    STATE_DOT[opt] ?? "bg-connect-text-disabled"
                  }`}
                />
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
