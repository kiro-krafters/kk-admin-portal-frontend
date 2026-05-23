type Key = { digit: string; letters?: string };

const KEYS: Key[] = [
  { digit: "1" },
  { digit: "2", letters: "ABC" },
  { digit: "3", letters: "DEF" },
  { digit: "4", letters: "GHI" },
  { digit: "5", letters: "JKL" },
  { digit: "6", letters: "MNO" },
  { digit: "7", letters: "PQRS" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ" },
  { digit: "*" },
  { digit: "0", letters: "+" },
  { digit: "#" },
];

type Props = {
  onPress: (digit: string) => void;
};

export default function Dialpad({ onPress }: Props) {
  return (
    <div className="grid h-full auto-rows-fr grid-cols-3 gap-x-4 gap-y-2 px-6 py-2">
      {KEYS.map((k) => (
        <button
          key={k.digit}
          type="button"
          onClick={() => onPress(k.digit)}
          className="mx-auto flex aspect-square h-full max-h-[84px] w-auto flex-col items-center justify-center rounded-full bg-connect-bg-alt text-connect-text transition-colors hover:bg-connect-border/70 active:bg-connect-border"
        >
          <span className="text-2xl font-medium leading-none">{k.digit}</span>
          {k.letters && (
            <span className="mt-1 text-[11px] font-semibold tracking-wider text-connect-text-secondary">
              {k.letters}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
