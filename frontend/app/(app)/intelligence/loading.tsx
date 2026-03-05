export default function IntelligenceLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">

      {/* Title */}
      <div className="h-7 w-56 rounded bg-gray-200 dark:bg-gray-800" />

      {/* Insight Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 border rounded-xl bg-[var(--surface)] space-y-2"
          >
            <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        ))}
      </div>

      {/* Analytics Dashboard */}
      <div className="border rounded-xl bg-[var(--surface)] p-6 space-y-4">
        <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-64 w-full rounded bg-gray-200 dark:bg-gray-800" />
      </div>

    </div>
  );
}