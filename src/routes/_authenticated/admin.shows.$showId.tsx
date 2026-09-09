import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ChevronRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  bookSeat,
  getShowDetail,
  lockSeatForCustomer,
  releaseSeatAdmin,
} from "@/lib/admin.functions";
import { SeatCell } from "@/components/admin/SeatCell";

export const Route = createFileRoute("/_authenticated/admin/shows/$showId")({
  component: SeatManagement,
});

function SeatManagement() {
  const { showId } = useParams({ from: "/_authenticated/admin/shows/$showId" });
  const qc = useQueryClient();
  const fn = useServerFn(getShowDetail);
  const lockFn = useServerFn(lockSeatForCustomer);
  const bookFn = useServerFn(bookSeat);
  const releaseFn = useServerFn(releaseSeatAdmin);

  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  const { data, refetch } = useQuery({
    queryKey: ["admin", "show", showId],
    queryFn: () => fn({ data: { showId } }),
    refetchInterval: 30000,
  });

  useEffect(() => {
    const ch = supabase
      .channel(`admin-show-${showId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "seats" }, () => refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "waitlist" }, () => refetch())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [showId, refetch]);

  const seats = data?.seats ?? [];
  const waitlist = data?.waitlist ?? [];
  const show = data?.show;

  const waitBySeat = useMemo(() => {
    const m = new Map<string, any[]>();
    for (const w of waitlist) {
      if (!m.has(w.seat_id)) m.set(w.seat_id, []);
      m.get(w.seat_id)!.push(w);
    }
    return m;
  }, [waitlist]);

  const rows = useMemo(() => {
    const g = new Map<string, any[]>();
    for (const s of seats) {
      if (!g.has(s.row_label)) g.set(s.row_label, []);
      g.get(s.row_label)!.push(s);
    }
    return Array.from(g.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  const currentSeat = seats.find((s: any) => s.id === selectedSeat);
  const currentQueue = selectedSeat ? waitBySeat.get(selectedSeat) ?? [] : [];
  const requireSelectedSeat = () => {
    if (!selectedSeat) throw new Error("Select a seat first");
    return selectedSeat;
  };

  const lockMut = useMutation({
    mutationFn: (phone: string) =>
      lockFn({ data: { seatId: requireSelectedSeat(), showId, phone } }),
    onSuccess: () => {
      toast.success("Seat locked");
      qc.invalidateQueries();
      refetch();
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const bookMut = useMutation({
    mutationFn: (phone: string | null) =>
      bookFn({ data: { seatId: requireSelectedSeat(), showId, phone } }),
    onSuccess: () => {
      toast.success("Booked");
      qc.invalidateQueries();
      refetch();
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const releaseMut = useMutation({
    mutationFn: () => releaseFn({ data: { seatId: requireSelectedSeat(), showId } }),
    onSuccess: () => {
      toast.success("Released — next in queue notified");
      qc.invalidateQueries();
      refetch();
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <div className="min-h-[calc(100vh-60px)] px-4 py-6 md:px-8">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to shows
      </Link>

      <div className="mb-6 mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            {show?.movie?.title ?? show?.movie_slug ?? showId}
          </h1>
          <div className="mt-1 text-sm text-muted-foreground">
            {show?.theatre ?? "SeatSync Cinema"} · {show?.time ?? "Showtime pending"} · {show?.screen ?? "Screen 1"}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-seat-available" />Available</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-seat-locked" />Locked</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-foreground" />Booked</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-primary" />Waitlist</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="admin-panel min-w-0 p-4 md:p-7">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-2 h-1 max-w-lg rounded-full bg-foreground/20" />
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Screen
            </div>
          </div>
          <div className="min-w-fit space-y-2">
            {rows.map(([row, list]) => (
              <div key={row} className="flex items-center gap-2">
                <div className="w-5 text-center text-xs font-semibold text-muted-foreground">
                  {row}
                </div>
                <div className="grid flex-1 gap-2" style={{ gridTemplateColumns: `repeat(${list.length}, minmax(28px, 1fr))` }}>
                  {list.map((s: any) => {
                    const queue = waitBySeat.get(s.id) ?? [];
                    return (
                      <SeatCell
                        key={s.id}
                        id={s.id}
                        status={s.status}
                        expiresAt={s.expires_at}
                        queueLength={queue.length}
                        selected={s.id === selectedSeat}
                        onClick={() => setSelectedSeat(s.id)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-7 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ChevronRight size={14} className="rotate-180" />
            Front of theatre
            <ChevronRight size={14} />
          </div>
        </section>

        <aside className="admin-panel h-fit lg:sticky lg:top-20">
          {!currentSeat ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface text-muted-foreground">
                <ChevronRight size={18} />
              </div>
              <div className="text-sm font-semibold text-foreground">Select a seat</div>
              <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Choose a seat from the map to view its status and queue.
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between border-b border-border px-5 py-4">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Seat</div>
                  <h2 className="mt-0.5 text-xl font-bold">{currentSeat.id}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`admin-badge ${currentSeat.status === "locked" ? "bg-seat-locked/15 text-seat-locked" : currentSeat.status === "booked" || currentSeat.status === "confirmed" ? "bg-foreground/10 text-muted-foreground" : "bg-seat-available/15 text-seat-available"}`}>
                  {currentSeat.status}
                  </span>
                  <button onClick={() => setSelectedSeat(null)} className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label="Close seat drawer">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {currentSeat.locked_by && (
                <div className="border-b border-border px-5 py-3 text-xs text-muted-foreground">
                  Held for <span className="font-semibold text-foreground">{currentSeat.locked_by}</span>
                </div>
              )}

              <div className="px-5 py-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Waitlist</div>
                  <span className="admin-badge bg-surface text-muted-foreground">{currentQueue.length}</span>
                </div>
                <div className="mb-4 max-h-64 overflow-y-auto">
                {currentQueue.length === 0 && (
                  <div className="border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
                    No one is waiting for this seat.
                  </div>
                )}
                {currentQueue.map((w: any) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between gap-3 border-b border-border py-2.5 text-xs last:border-b-0"
                  >
                    <div>
                      <span className="font-semibold text-primary">#{w.position}</span>{" "}
                      <span className="text-foreground">{w.phone}</span>
                    </div>
                    <div>
                      <button
                        onClick={() => lockMut.mutate(w.phone)}
                        disabled={lockMut.isPending || currentSeat.status !== "available"}
                        className="admin-btn border-seat-locked text-seat-locked hover:bg-seat-locked hover:text-primary-foreground"
                        title="Lock seat for this customer"
                      >
                        {lockMut.isPending ? "Locking…" : "Lock"}
                      </button>
                    </div>
                  </div>
                ))}
                </div>

                <div className="space-y-2 border-t border-border pt-4">
                {currentSeat.status === "locked" && (
                  <button
                    onClick={() => bookMut.mutate(currentSeat.locked_by ?? null)}
                    disabled={bookMut.isPending}
                    className="admin-btn admin-btn-primary w-full py-2"
                  >
                    {bookMut.isPending ? "Confirming…" : "Confirm booking"}
                  </button>
                )}
                {currentSeat.status !== "available" && (
                  <button
                    onClick={() => releaseMut.mutate()}
                    disabled={releaseMut.isPending}
                    className="admin-btn admin-btn-red w-full py-2"
                  >
                    {releaseMut.isPending ? "Releasing…" : "Release seat"}
                  </button>
                )}
                {currentSeat.status === "available" && currentQueue.length === 0 && (
                  <div className="py-2 text-center text-xs text-muted-foreground">
                    Available with no queue
                  </div>
                )}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
