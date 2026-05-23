import { useConnect } from "../../Utils/ConnectProvider";

export default function SentimentMeter() {
  const { sentiment } = useConnect();

  const score = sentiment?.score ?? 0.5;
  const label = sentiment?.label ?? "neutral";
  const percent = Math.round(score * 100);

  const labelColor =
    label === "positive"
      ? "text-connect-success"
      : label === "negative"
      ? "text-connect-error"
      : "text-connect-text-secondary";

  const trackColor =
    label === "positive"
      ? "bg-connect-success"
      : label === "negative"
      ? "bg-connect-error"
      : "bg-connect-warning";

  return (
    <section className="rounded-lg border border-connect-border bg-white p-3 shadow-connect-card">
      <header className="mb-2 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
          Contact Lens · Sentiment
        </h3>
        <span className="text-[10px] text-connect-text-disabled">Demo</span>
      </header>
      <div className="flex items-center justify-between">
        <p className={`text-lg font-semibold capitalize ${labelColor}`}>
          {sentiment ? label : "—"}
        </p>
        <p className="text-sm font-medium text-connect-text-secondary">
          {sentiment ? `${percent}%` : ""}
        </p>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-connect-bg-alt">
        <div
          className={`h-full transition-all duration-700 ${trackColor}`}
          style={{ width: sentiment ? `${percent}%` : "0%" }}
        />
      </div>
    </section>
  );
}
