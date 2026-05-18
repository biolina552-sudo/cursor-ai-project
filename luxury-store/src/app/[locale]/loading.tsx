export default function Loading() {
  return (
    <div className="container-shell grid gap-6 py-12 md:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="animate-pulse rounded-[2rem] border border-border p-4">
          <div className="aspect-[4/5] rounded-[1.5rem] bg-muted" />
          <div className="mt-5 h-4 w-2/3 rounded bg-muted" />
          <div className="mt-3 h-4 w-1/3 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
