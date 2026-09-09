import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { fetchSeats, joinWaitlist, type Seat } from "@/lib/seats";
import { findMovieByShowtime } from "@/lib/movies";
import { supabase } from "@/integrations/supabase/client";
import { SeatGrid, tierForRow } from "@/components/SeatGrid";
import { ThemeToggle } from "@/components/ThemeToggle";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/show/$showId")({
  head: ({ params }) => ({
    meta: [
      { title: `Pick your seat — SeatSync Bengaluru` },
      {
        name: "description",
        content:
          "Live seat map for a sold-out Bengaluru show. Select the seat you want and join the waitlist for an instant SMS when it frees up.",
      },
      { property: "og:title", content: "Pick your seat — SeatSync Bengaluru" },
      {
        property: "og:description",
        content: `Live seat map and waitlist for show ${params.showId}.`,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SeatPicker,
});

function SeatPicker() {
  const { showId } = useParams({ from: "/show/$showId" });
  const found = findMovieByShowtime(showId);
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: seats = [] } = useQuery({
    queryKey: ["seats"],
    queryFn: fetchSeats,
    refetchInterval: 15000,
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("seats-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "seats" },
        (payload) => {
          const oldSeat = payload.old as Partial<Seat> | undefined;
          const newSeat = payload.new as Partial<Seat> | undefined;
          qc.invalidateQueries({ queryKey: ["seats"] });

          if (newSeat && oldSeat && oldSeat.status === "available" && newSeat.status === "locked") {
            notify("warning", `Seat ${newSeat.id} is on hold — frees up in 2 min`);
          }
          if (newSeat && oldSeat && oldSeat.status === "locked" && newSeat.status === "available") {
            notify("success", `Seat ${newSeat.id} is now available!`);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 8) {
          notify("warning", "You can queue for up to 8 seats at a time");
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

  const validPhone = /^\d{10}$/.test(phone);
  const canSubmit = selected.size > 0 && validPhone && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const results = await joinWaitlist(Array.from(selected), phone);
      for (const r of results) {
        notify("success", `You're #${r.position} in queue for seat ${r.seatId}`);
      }
      setSelected(new Set());
      setPhone("");
    } catch (e) {
      notify("error", String((e as Error).message));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedList = useMemo(() => Array.from(selected).sort(), [selected]);
  const total = useMemo(
    () =>
      selectedList.reduce((sum, id) => sum + tierForRow(id.replace(/\d+/g, "")).price, 0),
    [selectedList],
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 lg:pb-10">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              aria-label="Back to movies"
              className="w-9 h-9 shrink-0 rounded-full border border-border bg-surface flex items-center justify-center hover:bg-surface-2 transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="min-w-0">
              <h1 className="text-base font-bold truncate">{found?.movie.title ?? "Show"}</h1>
              <p className="text-xs text-muted-foreground truncate">
                {found?.showtime.theatre} · {found?.city.name} · {found?.showtime.time} ·{" "}
                {found?.showtime.screen} · {found?.showtime.languages}
              </p>
            </div>

          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              Sold out
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <div className="card-soft p-4 md:p-8 overflow-x-auto">
          <SeatGrid seats={seats} selected={selected} onToggle={toggle} />
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden lg:block card-soft p-5 h-fit sticky top-24">
          <h2 className="text-lg font-bold mb-4">Join the waitlist</h2>
          <SeatChips selectedList={selectedList} toggle={toggle} />
          <PhoneField phone={phone} setPhone={setPhone} />
          {selectedList.length > 0 && (
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-muted-foreground">Est. ticket total</span>
              <span className="font-bold">₹{total}</span>
            </div>
          )}
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="btn-primary w-full py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Joining…" : "Join waitlist"}
          </button>
          <p className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground leading-relaxed">
            Green seats are open, amber seats are on hold, red is your pick. We&apos;ll SMS you the
            moment a seat in your queue frees up.
          </p>
        </aside>
      </div>

      {/* Mobile sticky bottom sheet */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border rounded-t-2xl p-4 shadow-[0_-8px_28px_-12px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm">
            <span className="font-bold">{selectedList.length}</span>{" "}
            <span className="text-muted-foreground">seat(s) selected</span>
          </div>
          {selectedList.length > 0 && <div className="text-sm font-bold">₹{total}</div>}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 flex rounded-full overflow-hidden border border-border">
            <span className="px-3 py-2.5 bg-surface text-sm text-muted-foreground">+91</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile"
              inputMode="numeric"
              className="flex-1 min-w-0 px-3 py-2.5 bg-transparent text-sm outline-none"
            />
          </div>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="btn-primary px-5 text-sm disabled:opacity-40"
          >
            {submitting ? "…" : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SeatChips({
  selectedList,
  toggle,
}: {
  selectedList: string[];
  toggle: (id: string) => void;
}) {
  return (
    <>
      <div className="label-caps text-[11px] text-muted-foreground mb-2">Selected seats</div>
      {selectedList.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-4">Tap a green seat to select it.</p>
      ) : (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedList.map((id) => (
            <button
              key={id}
              onClick={() => toggle(id)}
              className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
            >
              {id} ×
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function PhoneField({
  phone,
  setPhone,
}: {
  phone: string;
  setPhone: (v: string) => void;
}) {
  return (
    <>
      <div className="label-caps text-[11px] text-muted-foreground mb-2">Mobile number</div>
      <div className="flex rounded-full overflow-hidden border border-border mb-4 focus-within:border-primary transition-colors">
        <span className="px-3 py-2.5 bg-surface text-sm text-muted-foreground">+91</span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="10-digit mobile"
          inputMode="numeric"
          className="flex-1 min-w-0 px-3 py-2.5 bg-transparent text-sm outline-none"
        />
      </div>
    </>
  );
}
