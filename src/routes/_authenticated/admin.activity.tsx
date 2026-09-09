import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { listActivity } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/activity")({
  component: ActivityPage,
});

const ACTION_BADGE: Record<string, { bg: string; color: string }> = {
  lock: { bg: "#FEF3E2", color: "#F39C12" },
  book: { bg: "#EBF5FB", color: "#2980B9" },
  release: { bg: "#E8F8F0", color: "#27AE60" },
  waitlist_remove: { bg: "#FFF0F0", color: "#E23744" },
};

function ActivityPage() {
  const fn = useServerFn(listActivity);
  const { data = [], refetch } = useQuery({
    queryKey: ["admin", "activity"],
    queryFn: () => fn(),
    refetchInterval: 15000,
  });

  useEffect(() => {
    const ch = supabase
      .channel("admin-activity")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_activity" }, () =>
        refetch(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [refetch]);

  return (
    <div className="px-4 py-6 md:px-8">
      <h1 className="text-2xl font-bold text-foreground">Booking Logs</h1>
      <p className="mb-5 mt-1 text-[13px] text-muted-foreground">
        Every lock, booking and release performed by staff.
      </p>

      <div className="admin-panel overflow-x-auto bg-card">
        <table className="w-full">
          <thead>
            <tr>
              <th className="admin-th">Action</th>
              <th className="admin-th">Seat</th>
              <th className="admin-th">Target</th>
              <th className="admin-th">Actor</th>
              <th className="admin-th">Time</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-td text-center text-muted-foreground">
                  No activity yet
                </td>
              </tr>
            )}
            {data.map((a: any) => {
              const badge = ACTION_BADGE[a.action] ?? { bg: "#F0F0F0", color: "#717171" };
              return (
                <tr key={a.id} className="admin-row">
                  <td className="admin-td">
                    <span
                      className="admin-badge"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {a.action}
                    </span>
                  </td>
                  <td className="admin-td font-semibold text-foreground">{a.seat_id ?? "—"}</td>
                  <td className="admin-td text-foreground">{a.target_phone ?? "—"}</td>
                  <td className="admin-td text-muted-foreground">{a.actor_email ?? "unknown"}</td>
                  <td className="admin-td text-muted-foreground">
                    {new Date(a.created_at).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
