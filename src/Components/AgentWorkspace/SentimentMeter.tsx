import { useConnect } from "../../Utils/ConnectProvider";

export default function SentimentMeter() {
  const { sentiment, contact } = useConnect();

  if (sentiment) {
    const percent = Math.round(sentiment.score * 100);
    const labelColor =
      sentiment.label === "positive"
        ? "text-connect-success"
        : sentiment.label === "negative"
        ? "text-connect-error"
        : "text-connect-text-secondary";
    const trackColor =
      sentiment.label === "positive"
        ? "bg-connect-success"
        : sentiment.label === "negative"
        ? "bg-connect-error"
        : "bg-connect-warning";

    return (
      <section className="rounded-lg border border-connect-border bg-white p-3 shadow-connect-card">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
          Contact Lens · Sentiment
        </h3>
        <div className="flex items-center justify-between">
          <p className={`text-lg font-semibold capitalize ${labelColor}`}>
            {sentiment.label}
          </p>
          <p className="text-sm font-medium text-connect-text-secondary">
            {percent}%
          </p>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-connect-bg-alt">
          <div
            className={`h-full transition-all duration-700 ${trackColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-dashed border-connect-border bg-white p-3 shadow-connect-card">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
        Contact Lens · Sentiment
      </h3>
      <p className="mt-1 text-xs text-connect-text-secondary">
        {contact
          ? "Live sentiment requires the Contact Lens realtime stream. Enable Contact Lens on this flow and subscribe via Kinesis or AppSync."
          : "Will appear here when a contact is active and Contact Lens is enabled."}
      </p>
    </section>
  );
}
