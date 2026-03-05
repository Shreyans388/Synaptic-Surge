"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Clock3 } from "lucide-react";
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

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  if (!activeBrand?._id) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <section className="ui-panel p-6">
          <h1 className="mb-2 text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-[var(--muted)]">Select a brand to view notifications.</p>
        </section>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <section className="ui-panel p-6">
          <p className="text-sm text-[var(--muted)]">Loading notifications...</p>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <section className="ui-panel p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-500/12 p-2 text-sky-300">
              <Bell size={18} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Notifications</h1>
              <p className="text-sm text-[var(--muted)]">Activity stream for {activeBrand.name}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--muted)]">
              Total: {notifications.length}
            </span>
            <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-300">
              Unread: {unreadCount}
            </span>
          </div>
        </div>
      </section>

      {notifications.length === 0 ? (
        <section className="ui-panel p-6">
          <p className="text-sm text-[var(--muted)]">No notifications for this brand yet.</p>
        </section>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <article
              key={notification._id}
              className={`ui-panel p-4 ${
                notification.isRead
                  ? "opacity-90"
                  : "border-sky-500/45 bg-[color:color-mix(in_srgb,var(--surface)_88%,#0ea5e9_12%)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                    {typeLabel[notification.type]}
                  </p>
                  <h2 className="text-base font-semibold">{notification.title}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{notification.message}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--muted)]">
                    <Clock3 size={12} />
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.isRead ? (
                  <button
                    onClick={() => markReadMutation.mutate(notification._id)}
                    className="ui-btn-secondary px-3 py-1.5 text-xs"
                  >
                    <CheckCheck size={14} />
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
