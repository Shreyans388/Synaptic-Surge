export default function SettingsLoading() {
  return (
    <div className="max-w-4xl space-y-8 p-6 animate-pulse">

      {/* Title */}
      <div className="h-7 w-40 rounded bg-gray-200 dark:bg-gray-800" />

      {/* Brands */}
      <section className="ui-panel p-5 space-y-4">
        <div className="h-5 w-24 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="flex gap-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-9 w-24 rounded bg-gray-200 dark:bg-gray-800"/>
          ))}
        </div>
        <div className="h-10 w-28 rounded bg-gray-200 dark:bg-gray-800" />
      </section>

      {/* Brand Profile */}
      <section className="ui-panel p-5 space-y-4">
        <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-800" />

        <div className="grid md:grid-cols-2 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-10 rounded bg-gray-200 dark:bg-gray-800"/>
          ))}
        </div>

        <div className="h-24 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-10 w-40 rounded bg-gray-200 dark:bg-gray-800" />
      </section>

      {/* Social Connections */}
      <section className="ui-panel p-5 space-y-3">
        <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="flex gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-10 w-32 rounded bg-gray-200 dark:bg-gray-800"/>
          ))}
        </div>
      </section>

      {/* Account */}
      <section className="ui-panel p-5 space-y-3">
        <div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-10 w-28 rounded bg-gray-200 dark:bg-gray-800" />
      </section>

    </div>
  );
}