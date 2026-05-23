import type { ContactInfo } from "../../Utils/ConnectProvider";
import { useElapsed } from "../../Utils/useElapsed";
import { ChatBubbleIcon, HeadsetIcon } from "./WorkspaceIcons";

type Props = {
  contact: ContactInfo;
  attributes: Record<string, string>;
};

export default function ContactCard({ contact, attributes }: Props) {
  const isChat = contact.channel === "chat";
  const timerStart =
    contact.state === "connected" ? contact.acceptedAt ?? contact.startedAt : null;
  const elapsed = useElapsed(timerStart);

  const customerName =
    attributes.customerName ||
    attributes.CustomerName ||
    attributes.name ||
    (isChat ? "Chat customer" : contact.phoneNumber ?? "Unknown caller");
  const policyNumber = attributes.policyNumber || attributes.PolicyNumber || attributes.policy;
  const queueName = attributes.queueName || attributes.Queue || attributes.queue;

  const stateLabel =
    contact.state === "incoming"
      ? "Incoming"
      : contact.state === "connecting"
      ? contact.isInbound
        ? "Ringing"
        : "Calling"
      : contact.state === "connected"
      ? elapsed
      : contact.state;

  return (
    <div className="rounded-xl border border-connect-border bg-white p-5 shadow-connect-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <ChannelBadge channel={contact.channel} />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
              {contact.isInbound ? "Inbound contact" : "Outbound contact"}
            </p>
            <h2 className="text-lg font-semibold text-connect-text">
              {customerName}
            </h2>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-connect-text-secondary">
            Status
          </p>
          <p
            className={`text-lg font-semibold tabular-nums ${
              contact.state === "connected"
                ? "text-connect-text"
                : "text-connect-warning"
            }`}
          >
            {stateLabel}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-connect-border-soft pt-3 text-xs">
        <Field label="Phone">
          {contact.phoneNumber ?? <span className="text-connect-text-disabled">—</span>}
        </Field>
        <Field label="Policy">
          {policyNumber ?? <span className="text-connect-text-disabled">—</span>}
        </Field>
        <Field label="Queue">
          {queueName ?? <span className="text-connect-text-disabled">—</span>}
        </Field>
      </dl>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-connect-text-secondary">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-connect-text">{children}</dd>
    </div>
  );
}

function ChannelBadge({ channel }: { channel: string }) {
  const isChat = channel === "chat";
  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-full ${
        isChat
          ? "bg-connect-blue-soft text-connect-blue-dark"
          : "bg-connect-teal-soft text-connect-teal-dark"
      }`}
    >
      {isChat ? (
        <ChatBubbleIcon className="h-5 w-5" />
      ) : (
        <HeadsetIcon className="h-5 w-5" />
      )}
    </div>
  );
}
