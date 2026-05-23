import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CCPView = "dialer" | "quick-connects";

type CCPWindowValue = {
  isOpen: boolean;
  isMinimized: boolean;
  view: CCPView;
  /** Show the panel, optionally jumping to a specific view. */
  open: (view?: CCPView) => void;
  openNumberPad: () => void;
  openQuickConnects: () => void;
  close: () => void;
  minimize: () => void;
  restore: () => void;
  setView: (v: CCPView) => void;
};

const CCPWindowContext = createContext<CCPWindowValue | null>(null);

export function CCPWindowProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [view, setView] = useState<CCPView>("dialer");

  const open = useCallback((next?: CCPView) => {
    setIsOpen(true);
    setIsMinimized(false);
    if (next) setView(next);
  }, []);

  const openNumberPad = useCallback(() => open("dialer"), [open]);
  const openQuickConnects = useCallback(() => open("quick-connects"), [open]);
  const close = useCallback(() => setIsOpen(false), []);
  const minimize = useCallback(() => setIsMinimized(true), []);
  const restore = useCallback(() => setIsMinimized(false), []);

  const value = useMemo<CCPWindowValue>(
    () => ({
      isOpen,
      isMinimized,
      view,
      open,
      openNumberPad,
      openQuickConnects,
      close,
      minimize,
      restore,
      setView,
    }),
    [isOpen, isMinimized, view, open, openNumberPad, openQuickConnects, close, minimize, restore]
  );

  return (
    <CCPWindowContext.Provider value={value}>
      {children}
    </CCPWindowContext.Provider>
  );
}

export function useCCPWindow(): CCPWindowValue {
  const ctx = useContext(CCPWindowContext);
  if (!ctx) {
    throw new Error("useCCPWindow must be used inside <CCPWindowProvider>");
  }
  return ctx;
}
