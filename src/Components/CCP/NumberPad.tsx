import { useState } from "react";
import { DEFAULT_COUNTRY, type Country } from "../../Utils/countries";
import CountrySelect from "./CountrySelect";
import Dialpad from "./Dialpad";
import { CloseIcon, PhoneIcon, QuickConnectIcon } from "./icons";

type Props = {
  onClose: () => void;
  onCall: (e164Number: string) => void;
  onQuickConnects?: () => void;
  disableCall?: boolean;
};

export default function NumberPad({
  onClose,
  onCall,
  onQuickConnects,
  disableCall,
}: Props) {
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [number, setNumber] = useState("");

  const trimmed = number.trim().replace(/[^\d+]/g, "");
  const callDisabled = disableCall || trimmed.length === 0;

  const handleKey = (digit: string) => {
    setNumber((prev) => prev + digit);
  };

  const handleCall = () => {
    if (callDisabled) return;
    const e164 = trimmed.startsWith("+")
      ? trimmed
      : `${country.dialCode}${trimmed}`;
    onCall(e164);
  };

  return (
    <section className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between px-4 pt-4">
        <h2 className="text-base font-semibold text-connect-text">
          Number pad
        </h2>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="rounded p-1 text-connect-text-secondary hover:bg-connect-bg-alt"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 pt-3">
        <label
          htmlFor="ccp-phone-number"
          className="text-xs font-semibold text-connect-text"
        >
          Phone number
        </label>
        <div className="mt-1 flex items-center gap-1 rounded-md border border-connect-border px-2 py-1.5 focus-within:border-connect-teal focus-within:ring-1 focus-within:ring-connect-teal">
          <CountrySelect value={country} onChange={setCountry} />
          <span className="h-5 w-px bg-connect-border" />
          <input
            id="ccp-phone-number"
            type="tel"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Enter a phone number"
            className="w-full bg-transparent text-sm text-connect-text placeholder:italic placeholder:text-connect-text-disabled focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-col py-2">
        <Dialpad onPress={handleKey} />
      </div>

      <footer className="flex items-center gap-2 border-t border-connect-border px-3 py-3">
        <button
          type="button"
          onClick={onQuickConnects}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-connect-teal px-3 py-1.5 text-sm font-medium text-connect-teal-dark hover:bg-connect-teal-soft"
        >
          <QuickConnectIcon className="h-4 w-4" />
          Quick connects
        </button>
        <button
          type="button"
          disabled={callDisabled}
          onClick={handleCall}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            callDisabled
              ? "cursor-not-allowed bg-connect-bg-alt text-connect-text-disabled"
              : "bg-connect-teal text-white hover:bg-connect-teal-dark"
          }`}
        >
          <PhoneIcon className="h-4 w-4" />
          Call
        </button>
      </footer>
    </section>
  );
}
