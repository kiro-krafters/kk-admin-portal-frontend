type Props = {
  title: string;
  message?: string;
};

export default function Placeholder({ title, message }: Props) {
  return (
    <section className="flex h-full flex-col items-center justify-center bg-white px-6 text-center">
      <h2 className="text-base font-semibold text-connect-text">{title}</h2>
      {message && (
        <p className="mt-2 max-w-xs text-sm text-connect-text-secondary">
          {message}
        </p>
      )}
    </section>
  );
}
