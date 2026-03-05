export default function NotificationsLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6 animate-pulse">

      {/* Header Panel */}
      <section className="ui-panel p-5 space-y-3">
        <div className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-56 rounded bg-gray-200 dark:bg-gray-800" />

        <div className="flex gap-3 mt-3">
          <div className="h-7 w-20 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="h-7 w-20 rounded-full bg-gray-200 dark:bg-gray-800" />
        </div>
      </section>

      {/* Notification Cards */}
      {[1, 2, 3].map((i) => (
        <section key={i} className="ui-panel p-4 space-y-2">
          <div className="h-3 w-28 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-5 w-64 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-800" />
        </section>
      ))}

    </div>
  );
}