import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Armchair, CheckCircle2, Lock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { listShowsWithCounts } from "@/lib/admin.functions";
import { DemoCancellationWidget } from "@/components/admin/DemoCancellationWidget";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardPage,
});

function StatCard({
  label,
  value,
  color,
  Icon,
}: {
  label: string;
  value: number;
  color: string;
  Icon: typeof Armchair;
}) {
  return (
    <div className="admin-card admin-card-hover flex items-center gap-4 p-5">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ background: "#FFF0F0", color }}
      >
        <Icon size={18} />
      </div>
      <div>
        <div className="text-[28px] font-bold leading-none" style={{ color }}>
          {value}
        </div>
        <div className="mt-1 text-[13px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const fn = useServerFn(listShowsWithCounts);
  const navigate = useNavigate();
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin", "shows"],
    queryFn: () => fn(),
    refetchInterval: 15000,
  });

  useEffect(() => {
    const channel = supabase
      .channel("admin-shows")
      .on("postgres_changes", { event: "*", schema: "public", table: "seats" }, () => refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "waitlist" }, () => refetch())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const c = data?.counts;
  const shows = data?.shows ?? [];

  return (
    <div className="px-4 py-6 md:px-8">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Live seat and waitlist overview across the venue.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Seats" value={c?.total ?? 0} color="#717171" Icon={Armchair} />
        <StatCard label="Available" value={c?.available ?? 0} color="#2ECC71" Icon={CheckCircle2} />
        <StatCard label="Locked" value={c?.locked ?? 0} color="#F39C12" Icon={Lock} />
        <StatCard label="Waitlist Entries" value={c?.waitlisted ?? 0} color="#E23744" Icon={Users} />
      </div>

      <div id="admin-controls" className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto]">
        <div className="admin-card p-4 text-[13px] text-muted-foreground">
          Note: this venue uses a shared seat pool — counts reflect the whole cinema.
        </div>
        <DemoCancellationWidget />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-bold text-foreground">Shows</h2>
      {isLoading ? (
        <div className="text-[13px] text-muted-foreground">Loading shows…</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shows.map((s: any) => (
            <button
              key={s.id}
              onClick={() => navigate({ to: "/admin/shows/$showId", params: { showId: s.id } })}
              className="admin-card admin-card-hover overflow-hidden text-left"
            >
              <div className="h-20" style={{ background: s.movie?.poster ?? "#F0F0F0" }} />
              <div className="space-y-1 p-3">
                <div className="truncate text-sm font-semibold text-foreground">
                  {s.movie?.title ?? s.movie_slug}
                </div>
                <div className="flex justify-between text-[12px] text-muted-foreground">
                  <span>{s.time}</span>
                  <span>{s.screen}</span>
                </div>
                <div className="truncate text-[12px] text-muted-foreground">{s.theatre}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
