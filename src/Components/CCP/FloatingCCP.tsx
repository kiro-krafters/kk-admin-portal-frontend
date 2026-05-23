import { useCallback, useEffect, useRef, useState } from "react";
import { MinusIcon, PhoneFabIcon } from "../AdminShell/AdminIcons";
import { useConnect } from "../../Utils/ConnectProvider";
import { useCCPWindow } from "../../Utils/CCPWindowContext";
import CCP from "./CCP";
import { CloseIcon, GripIcon } from "./icons";

const PANEL_WIDTH = 380;
const PANEL_HEIGHT = 640;
const MARGIN = 16;

type Position = { x: number; y: number };

function clampPosition(p: Position): Position {
  const maxX = Math.max(MARGIN, window.innerWidth - PANEL_WIDTH - MARGIN);
  const maxY = Math.max(MARGIN, window.innerHeight - PANEL_HEIGHT - MARGIN);
  return {
    x: Math.min(Math.max(MARGIN, p.x), maxX),
    y: Math.min(Math.max(MARGIN, p.y), maxY),
  };
}

function initialPosition(): Position {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  return clampPosition({
    x: window.innerWidth - PANEL_WIDTH - MARGIN,
    y: window.innerHeight - PANEL_HEIGHT - MARGIN - 64,
  });
}

export default function FloatingCCP() {
  const { isOpen, isMinimized, open, close, minimize, restore } = useCCPWindow();
  const [pos, setPos] = useState<Position>(initialPosition);
  const { contact } = useConnect();
  const dragOffsetRef = useRef<{ dx: number; dy: number } | null>(null);

  // Auto-open when a contact arrives.
  useEffect(() => {
    if (contact) {
      open();
    }
  }, [contact, open]);

  useEffect(() => {
    function onResize() {
      setPos((p) => clampPosition(p));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onPointerMove = useCallback((e: PointerEvent) => {
    const o = dragOffsetRef.current;
    if (!o) return;
    setPos(clampPosition({ x: e.clientX - o.dx, y: e.clientY - o.dy }));
  }, []);

  const onPointerUp = useCallback(() => {
    dragOffsetRef.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }, [onPointerMove]);

  const onDragHandlePointerDown = (e: React.PointerEvent) => {
    dragOffsetRef.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => open()}
        aria-label="Open CCP"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-connect-teal text-white shadow-connect-panel transition-transform hover:scale-105 hover:bg-connect-teal-dark"
      >
        <PhoneFabIcon className="h-6 w-6" />
        {contact && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-connect-error text-[10px] font-bold text-white">
            !
          </span>
        )}
      </button>
    );
  }

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={restore}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-connect-teal-dark px-4 py-2 text-sm font-medium text-white shadow-connect-panel hover:bg-connect-navy"
      >
        <PhoneFabIcon className="h-4 w-4 text-white" />
        CCP {contact ? "· active call" : ""}
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Amazon Connect CCP"
      className="fixed z-40 overflow-hidden rounded-lg border border-connect-border bg-white shadow-connect-panel"
      style={{
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
        left: pos.x,
        top: pos.y,
      }}
    >
      <div
        onPointerDown={onDragHandlePointerDown}
        className="flex h-7 cursor-move items-center justify-between bg-gradient-to-r from-connect-teal-dark to-connect-teal px-2 text-white"
      >
        <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-white/80">
          <GripIcon className="h-3.5 w-3.5 text-white/60" />
          Amazon Connect CCP
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Minimize"
            onClick={minimize}
            className="flex h-5 w-5 items-center justify-center rounded text-white/80 hover:bg-white/15"
          >
            <MinusIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="flex h-5 w-5 items-center justify-center rounded text-white/80 hover:bg-connect-error"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="h-[calc(100%-1.75rem)]">
        <CCP />
      </div>
    </div>
  );
}
