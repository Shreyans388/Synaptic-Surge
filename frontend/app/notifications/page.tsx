"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markNotificationRead,
  type NotificationRecord,
} from "@/services/api/notifications.api";
import { useGlobalStore } from "@/state/global.store";

const typeLabel: Record<NotificationRecord["type"], string> = {
  post_generated: "Post Generated",
  post_published: "Post Published",
  analytics_ready: "Analytics Ready",
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const activeBrand = useGlobalStore((s) => s.activeBrand);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", activeBrand?._id],
    queryFn: () => getNotifications(activeBrand?._id, 100),
    enabled: !!activeBrand?._id,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", activeBrand?._id],
      });
    },
  });

  if (!activeBrand?._id) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Notifications</h1>
        <p className="text-sm text-[var(--muted)]">Select a brand to view notifications.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-6">Loading notifications...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      {notifications.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No notifications for this brand yet.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <article
              key={notification._id}
              className={`rounded-xl border p-4 ${
                notification.isRead
                  ? "border-[var(--border)] bg-[var(--surface)]"
                  : "border-sky-300 bg-sky-50/40 dark:border-sky-800 dark:bg-sky-900/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                    {typeLabel[notification.type]}
                  </p>
                  <h2 className="text-base font-semibold">{notification.title}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{notification.message}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.isRead ? (
                  <button
                    onClick={() => markReadMutation.mutate(notification._id)}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:border-[var(--border-strong)]"
                  >
                    Mark read
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
