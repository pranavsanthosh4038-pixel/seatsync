import { useEffect, useState } from "react";

type Props = {
  id: string;
  status: string;
  expiresAt: string | null;
  queueLength: number;
  selected: boolean;
  onClick: () => void;
};

export function SeatCell({ id, status, expiresAt, queueLength, selected, onClick }: Props) {
  const [remaining, setRemaining] = useState<number>(() =>
    expiresAt ? Math.max(0, new Date(expiresAt).getTime() - Date.now()) : 0,
  );

  useEffect(() => {
    if (!expiresAt) return;
    const t = setInterval(() => {
      setRemaining(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  const secs = Math.floor(remaining / 1000);
  const mm = String(Math.floor(secs / 60)).padStart(1, "0");
  const ss = String(secs % 60).padStart(2, "0");

  const statusClass =
    status === "locked"
      ? "bg-seat-locked animate-[seat-pulse_1.8s_ease-in-out_infinite]"
      : status === "booked" || status === "confirmed"
        ? "bg-foreground"
        : "bg-seat-available";

  return (
    <button
      onClick={onClick}
      className={`relative flex aspect-square items-center justify-center rounded-[4px] text-[8px] font-semibold text-primary-foreground transition-all ${statusClass} ${selected ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}`}
      title={`${id} · ${status}${queueLength ? ` · ${queueLength} waiting` : ""}`}
    >
      <span className="leading-none">{id}</span>
      {status === "locked" && remaining > 0 && (
        <span
          className="absolute bottom-0 right-0.5 text-[7px] leading-none"
        >
          {mm}:{ss}
        </span>
      )}
      {queueLength > 0 && (
        <span
          className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground"
        >
          {queueLength > 9 ? "9+" : queueLength}
        </span>
      )}
    </button>
  );
}
