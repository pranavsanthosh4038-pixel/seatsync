import { supabase } from "@/integrations/supabase/client";
import { sendSms } from "@/lib/sms.functions";

function fireSms(phone: string, message: string) {
  // Fire and forget — never block UI on SMS delivery
  sendSms({ data: { phone, message } })
    .then((r) => {
      if (!r?.ok) console.warn("[sms] failed:", r?.error);
    })
    .catch((e) => console.warn("[sms] error:", e));
}

export type Seat = {
  id: string;
  row_label: string;
  seat_number: number;
  status: "available" | "locked";
  locked_by: string | null;
  locked_at: string | null;
  expires_at: string | null;
};

export type WaitlistEntry = {
  id: string;
  seat_id: string;
  phone: string;
  position: number;
  joined_at: string;
  notified: boolean;
};

export async function fetchSeats(): Promise<Seat[]> {
  const { data, error } = await supabase
    .from("seats")
    .select("*")
    .order("row_label", { ascending: true })
    .order("seat_number", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Seat[];
}

export async function lockSeat(seatId: string, lockedBy = "admin") {
  const now = new Date();
  const expires = new Date(now.getTime() + 2 * 60 * 1000);
  const { error } = await supabase
    .from("seats")
    .update({
      status: "locked",
      locked_by: lockedBy,
      locked_at: now.toISOString(),
      expires_at: expires.toISOString(),
    })
    .eq("id", seatId);
  if (error) throw error;
}

export async function releaseSeat(seatId: string): Promise<WaitlistEntry | null> {
  // Only release if currently locked (idempotent for countdown auto-release)
  const { error } = await supabase
    .from("seats")
    .update({
      status: "available",
      locked_by: null,
      locked_at: null,
      expires_at: null,
    })
    .eq("id", seatId)
    .eq("status", "locked");
  if (error) throw error;

  const { data: next } = await supabase
    .from("waitlist")
    .select("*")
    .eq("seat_id", seatId)
    .eq("notified", false)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (next) {
    await supabase.from("waitlist").update({ notified: true }).eq("id", next.id);
    fireSms(
      next.phone,
      `SeatSync: Seat ${seatId} is now FREE! You were #${next.position} in the queue. Book it fast before someone else grabs it.`,
    );
    return next as WaitlistEntry;
  }
  return null;
}

export async function joinWaitlist(seatIds: string[], phone: string) {
  const results: { seatId: string; position: number }[] = [];
  for (const seatId of seatIds) {
    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true })
      .eq("seat_id", seatId);
    const position = (count ?? 0) + 1;
    const { error } = await supabase
      .from("waitlist")
      .insert({ seat_id: seatId, phone, position });
    if (error) throw error;
    results.push({ seatId, position });
  }
  if (results.length > 0) {
    const summary = results
      .map((r) => `${r.seatId} (#${r.position})`)
      .join(", ");
    fireSms(
      phone,
      `SeatSync: You're on the waitlist for ${summary}. We'll text you the moment a seat opens up.`,
    );
  }
  return results;
}

export async function getTotalWaitlistCount(): Promise<number> {
  const { count } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}
