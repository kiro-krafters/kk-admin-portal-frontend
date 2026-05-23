type Props = {
  title: string;
  description?: string;
};

export default function StubPage({ title, description }: Props) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-connect-bg-alt p-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-connect-text">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-connect-text-secondary">
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-connect-border bg-white">
        <div className="max-w-sm text-center">
          <p className="text-sm font-medium text-connect-text">
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
