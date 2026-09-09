import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { listWaitlist, removeWaitlistEntry } from "@/lib/admin.functions";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/_authenticated/admin/waitlist")({
  component: WaitlistPage,
});

function WaitlistPage() {
  const listFn = useServerFn(listWaitlist);
  const removeFn = useServerFn(removeWaitlistEntry);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data = [], refetch } = useQuery({
    queryKey: ["admin", "waitlist"],
    queryFn: () => listFn(),
    refetchInterval: 20000,
  });

  useEffect(() => {
    const ch = supabase
      .channel("admin-waitlist")
      .on("postgres_changes", { event: "*", schema: "public", table: "waitlist" }, () => refetch())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [refetch]);

  const remove = useMutation({
    mutationFn: (id: string) => removeFn({ data: { id } }),
    onSuccess: () => {
      notify("success", "Entry removed");
      qc.invalidateQueries();
      refetch();
    },
    onError: (e: any) => notify("error", e?.message ?? "Failed"),
  });

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return data;
    return data.filter(
      (w: any) => w.phone.includes(q) || w.seat_id.toLowerCase().includes(q.toLowerCase()),
    );
  }, [data, search]);

  return (
    <div className="px-4 py-6 md:px-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Waitlist Manager</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {filtered.length} of {data.length} entries
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search phone or seat…"
          className="min-w-[240px] rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        />
      </div>

      <div className="admin-panel overflow-x-auto bg-card">
        <table className="w-full">
          <thead>
            <tr>
              <th className="admin-th">Seat</th>
              <th className="admin-th">Phone</th>
              <th className="admin-th">Position</th>
              <th className="admin-th">Joined</th>
              <th className="admin-th">Status</th>
              <th className="admin-th"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="admin-td text-center text-muted-foreground">
                  No entries
                </td>
              </tr>
            )}
            {filtered.map((w: any) => (
              <tr key={w.id} className="admin-row">
                <td className="admin-td font-semibold text-foreground">{w.seat_id}</td>
                <td className="admin-td text-foreground">{w.phone}</td>
                <td className="admin-td text-muted-foreground">#{w.position}</td>
                <td className="admin-td text-muted-foreground">
                  {new Date(w.joined_at).toLocaleString()}
                </td>
                <td className="admin-td">
                  {w.notified ? (
                    <span className="admin-badge" style={{ background: "#EBF5FB", color: "#2980B9" }}>
                      Notified
                    </span>
                  ) : (
                    <span className="admin-badge" style={{ background: "#F0F0F0", color: "#717171" }}>
                      Pending
                    </span>
                  )}
                </td>
                <td className="admin-td text-right">
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${w.phone} from waitlist for ${w.seat_id}?`))
                        remove.mutate(w.id);
                    }}
                    className="admin-btn admin-btn-grey"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
