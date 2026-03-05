export default function Loading() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-pulse">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-800" />

        <div className="h-10 w-36 rounded-xl bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* SOCIAL CONNECTION CARD */}
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B0E14] p-6">
        <div className="h-5 w-64 rounded bg-gray-200 dark:bg-gray-800 mb-3" />
        <div className="h-4 w-96 rounded bg-gray-200 dark:bg-gray-800 mb-6" />

        <div className="flex gap-4">
          <div className="h-10 w-40 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-10 w-40 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-10 w-40 rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B0E14]"
          >
            <div className="flex justify-between">
              <div>
                <div className="h-3 w-24 mb-3 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-8 w-16 rounded bg-gray-200 dark:bg-gray-800" />
              </div>

              <div className="h-12 w-12 rounded-2xl bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        ))}
      </div>

      {/* ANALYTICS DASHBOARD */}
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B0E14] p-6 space-y-6">

        <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-800" />

        {/* chart skeleton */}
        <div className="h-64 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />

        {/* table skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((row) => (
            <div
              key={row}
              className="h-10 w-full rounded bg-gray-200 dark:bg-gray-800"
            />
          ))}
        </div>

      </div>

    </div>
  );
}