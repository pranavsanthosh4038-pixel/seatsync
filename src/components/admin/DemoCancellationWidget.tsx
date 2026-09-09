import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchSeats, lockSeat, releaseSeat, type Seat } from "@/lib/seats";

export function DemoCancellationWidget() {
  const qc = useQueryClient();
  const { data: seats = [] } = useQuery({
    queryKey: ["demo-widget", "seats"],
    queryFn: fetchSeats,
    refetchInterval: 5000,
  });

  const [selectedId, setSelectedId] = useState<string>("");
  const [remaining, setRemaining] = useState<number>(0);

  const selected: Seat | undefined = seats.find((s) => s.id === selectedId);

  useEffect(() => {
    if (!selected || selected.status !== "locked" || !selected.expires_at) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      const ms = new Date(selected.expires_at!).getTime() - Date.now();
      setRemaining(Math.max(0, Math.floor(ms / 1000)));
    };
    tick();
    const int = setInterval(tick, 1000);
    return () => clearInterval(int);
  }, [selected]);

  const lockMut = useMutation({
    mutationFn: () => lockSeat(selectedId, "admin-demo"),
    onSuccess: () => {
      toast.success(`Locked ${selectedId} for 2 min`);
      qc.invalidateQueries({ queryKey: ["demo-widget", "seats"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Lock failed"),
  });

  const releaseMut = useMutation({
    mutationFn: () => releaseSeat(selectedId),
    onSuccess: (next) => {
      toast.success(
        next ? `Released — notified next in queue (${next.phone})` : `Released ${selectedId}`,
      );
      qc.invalidateQueries({ queryKey: ["demo-widget", "seats"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Release failed"),
  });

  const isLocked = selected?.status === "locked";
  const lockedSeats = seats.filter((s) => s.status === "locked");

  const mmss = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(
    remaining % 60,
  ).padStart(2, "0")}`;

  return (
    <div className="admin-card max-w-sm p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-foreground">Manual seat controls</div>
        <span className="h-2.5 w-2.5 rounded-full bg-seat-locked" />
      </div>

      <label className="mb-1 block text-xs font-medium text-muted-foreground">Select seat</label>
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="mb-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30"
      >
        <option value="">— pick a seat —</option>
        {seats.map((s) => (
          <option key={s.id} value={s.id}>
            {s.id} — {s.status}
            {s.locked_by ? ` (${s.locked_by})` : ""}
          </option>
        ))}
      </select>

      {lockedSeats.length > 0 && (
        <div className="mb-4">
          <div className="mb-1 text-xs font-medium text-muted-foreground">
            Held by users ({lockedSeats.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {lockedSeats.slice(0, 12).map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`admin-badge border border-seat-locked ${s.id === selectedId ? "bg-seat-locked text-primary-foreground" : "bg-seat-locked/15 text-seat-locked"}`}
                title={s.locked_by ? `Locked by ${s.locked_by}` : "Locked"}
              >
                {s.id}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        disabled={!selected || isLocked || lockMut.isPending}
        onClick={() => lockMut.mutate()}
        className="admin-btn admin-btn-amber mb-3 w-full py-2.5"
      >
        {isLocked ? `Locked · ${mmss}` : "Lock Seat (2 min)"}
      </button>

      <button
        disabled={!selected || selected.status === "available" || releaseMut.isPending}
        onClick={() => releaseMut.mutate()}
        className="admin-btn admin-btn-red w-full py-2.5"
      >
        {isLocked && selected?.locked_by ? "Force Release (user hold)" : "Release Seat Now"}
      </button>

      <div className="mt-4 text-center text-xs text-muted-foreground">
        Manual override · notifies next in queue
      </div>

    </div>
  );
}
