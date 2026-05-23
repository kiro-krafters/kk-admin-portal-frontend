import { useCCPWindow } from "../Utils/CCPWindowContext";
import { PhoneFabIcon } from "../Components/AdminShell/AdminIcons";

type Props = {
  title: string;
  description?: string;
};

export default function StubPage({ title, description }: Props) {
  const { openNumberPad } = useCCPWindow();
  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-connect-bg-alt p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-connect-text">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-connect-text-secondary">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={openNumberPad}
          className="hidden items-center gap-2 rounded-md border border-connect-teal bg-white px-3 py-1.5 text-sm font-medium text-connect-teal-dark hover:bg-connect-teal-soft md:inline-flex"
        >
          <PhoneFabIcon className="h-4 w-4" />
          Number pad
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-connect-border bg-white shadow-connect-card">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-connect-teal-soft text-connect-teal-dark">
            ⚙
          </div>
          <p className="mt-3 text-sm font-medium text-connect-text">
            Coming soon
          </p>
          <p className="mt-1 text-xs text-connect-text-secondary">
            This screen will be wired up in a future iteration of the MVP.
          </p>
        </div>
      </div>
    </div>
  );
}
