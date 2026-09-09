import { useEffect, useState, useCallback } from "react";
import { releaseSeat, type Seat } from "@/lib/seats";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export const TIERS = [
  { name: "Recliner", price: 450, rows: ["A", "B", "C", "D"] },
  { name: "Prime", price: 320, rows: ["E", "F", "G", "H"] },
  { name: "Classic", price: 220, rows: ["I", "J", "K", "L"] },
];

export function tierForRow(row: string) {
  return TIERS.find((t) => t.rows.includes(row)) ?? TIERS[2];
}

function useTick(ms = 1000) {
  const [, setT] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setT((x) => x + 1), ms);
    return () => clearInterval(i);
  }, [ms]);
}

function fmtCountdown(expiresAt: string | null): string {
  if (!expiresAt) return "";
  const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now());
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function SeatGrid({
  seats,
  selected,
  onToggle,
}: {
  seats: Seat[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  useTick(1000);

  const seatMap = new Map(seats.map((s) => [s.id, s]));
  const autoRelease = useCallback(async () => {
    const now = Date.now();
    for (const seat of seats) {
      if (
        seat.status === "locked" &&
        seat.expires_at &&
        new Date(seat.expires_at).getTime() <= now
      ) {
        try {
          await releaseSeat(seat.id);
        } catch {
          /* another client won */
        }
      }
    }
  }, [seats]);
  useEffect(() => {
    autoRelease();
  }, [autoRelease]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Screen */}
      <div className="w-full max-w-3xl mb-10">
        <div
          className="h-1.5 mx-auto rounded-full bg-border"
          style={{ width: "72%" }}
        />
        <div className="text-center mt-3 text-xs label-caps text-muted-foreground">
          Screen this way
        </div>
      </div>

      <div className="flex flex-col gap-5 w-full max-w-4xl">
        {[...TIERS].reverse().map((tier) => (
          <div key={tier.name}>
            <div className="flex items-center gap-3 mb-2 px-1">
              <span className="text-xs font-semibold text-foreground">{tier.name}</span>
              <span className="text-xs text-muted-foreground">₹{tier.price}</span>
              <span className="flex-1 h-px bg-border" />
            </div>
            <div className="flex flex-col gap-1.5">
              {[...tier.rows].reverse().map((row) => {

                const rowSeats = Array.from({ length: 16 }, (_, i) =>
                  seatMap.get(`${row}${i + 1}`),
                );
                return (
                  <div key={row} className="flex items-center justify-center gap-4">
                    <div className="w-5 text-right text-[11px] text-muted-foreground">{row}</div>
                    <div className="flex gap-1.5">
                      {rowSeats.slice(0, 5).map((s, i) => (
                        <SeatCell key={i} seat={s} selected={s ? selected.has(s.id) : false} onToggle={onToggle} />
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      {rowSeats.slice(5, 11).map((s, i) => (
                        <SeatCell key={i + 5} seat={s} selected={s ? selected.has(s.id) : false} onToggle={onToggle} />
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      {rowSeats.slice(11, 16).map((s, i) => (
                        <SeatCell key={i + 11} seat={s} selected={s ? selected.has(s.id) : false} onToggle={onToggle} />
                      ))}
                    </div>
                    <div className="w-5 text-[11px] text-muted-foreground">{row}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-10 flex flex-wrap gap-5 justify-center text-xs text-muted-foreground">
        <LegendDot color="var(--seat-available)" label="Available" />
        <LegendDot color="var(--seat-locked)" label="On hold" />
        <LegendDot color="var(--seat-selected)" label="Your pick" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block w-3.5 h-3.5 rounded-md" style={{ background: color }} />
      {label}
    </div>
  );
}

function SeatCell({
  seat,
  selected,
  onToggle,
}: {
  seat: Seat | undefined;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  if (!seat) return <div className="w-7 h-7" />;

  const locked = seat.status === "locked";
  const countdown = locked ? fmtCountdown(seat.expires_at) : "";

  let bg = "transparent";
  let border = "var(--seat-available)";
  let color = "var(--seat-available)";

  if (locked) {
    bg = "color-mix(in oklab, var(--seat-locked) 16%, transparent)";
    border = "var(--seat-locked)";
    color = "var(--seat-locked)";
  } else if (selected) {
    bg = "var(--seat-selected)";
    border = "var(--seat-selected)";
    color = "#fff";
  }

  return (
    <div className="relative w-7 h-7 flex items-center justify-center">
      {locked && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-[color:var(--seat-locked)] whitespace-nowrap pointer-events-none">
          {countdown}
        </div>
      )}
      <button
        onClick={() => !locked && onToggle(seat.id)}
        disabled={locked}
        aria-label={`Seat ${seat.id}`}
        className="w-6 h-6 rounded-lg text-[9px] font-semibold transition-all hover:scale-110 disabled:hover:scale-100"
        style={{
          background: bg,
          border: `1.5px solid ${border}`,
          color,
          cursor: locked ? "not-allowed" : "pointer",
        }}
      >
        {seat.seat_number}
      </button>
    </div>
  );
}
