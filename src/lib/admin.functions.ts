import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LOCK_MINUTES = 10;

async function logActivity(
  supabase: any,
  actorEmail: string | null,
  actorId: string,
  action: string,
  fields: {
    seat_id?: string | null;
    show_id?: string | null;
    target_phone?: string | null;
    details?: Record<string, unknown>;
  },
) {
  await supabase.from("admin_activity").insert({
    actor_id: actorId,
    actor_email: actorEmail,
    action,
    seat_id: fields.seat_id ?? null,
    show_id: fields.show_id ?? null,
    target_phone: fields.target_phone ?? null,
    details: fields.details ?? {},
  });
}

async function fireSmsBg(phone: string, message: string) {
  try {
    const { sendSms } = await import("./sms.functions");
    await sendSms({ data: { phone, message } });
  } catch (e) {
    console.warn("[admin sms] fail", e);
  }
}

// ------- SHOWS LIST WITH COUNTS -------
export const listShowsWithCounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;

    const [showsRes, moviesRes, seatsRes, waitRes] = await Promise.all([
      supabase.from("shows").select("*").order("id"),
      supabase.from("movies").select("*"),
      supabase.from("seats").select("status"),
      supabase.from("waitlist").select("id"),
    ]);

    if (showsRes.error) throw showsRes.error;
    if (moviesRes.error) throw moviesRes.error;

    const seats = seatsRes.data ?? [];
    const total = seats.length;
    const locked = seats.filter((s: any) => s.status === "locked").length;
    const booked = seats.filter((s: any) => s.status === "booked").length;
    const available = seats.filter((s: any) => s.status === "available").length;
    const waitlisted = waitRes.data?.length ?? 0;

    const movies = new Map((moviesRes.data ?? []).map((m: any) => [m.slug, m]));
    const shows = (showsRes.data ?? []).map((s: any) => ({
      ...s,
      movie: movies.get(s.movie_slug) ?? null,
    }));

    return {
      shows,
      counts: { total, locked, booked, available, waitlisted },
    };
  });

// ------- GET SHOW DETAIL -------
export const getShowDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ showId: z.string() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const [showRes, seatsRes, waitRes] = await Promise.all([
      supabase.from("shows").select("*, movie:movies(*)").eq("id", data.showId).maybeSingle(),
      supabase.from("seats").select("*").order("row_label").order("seat_number"),
      supabase.from("waitlist").select("*").order("seat_id").order("position"),
    ]);
    if (showRes.error) throw showRes.error;
    return {
      show: showRes.data,
      seats: seatsRes.data ?? [],
      waitlist: waitRes.data ?? [],
    };
  });

// ------- LOCK SEAT -------
export const lockSeatForCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      seatId: z.string(),
      showId: z.string().nullable(),
      phone: z.string().min(1),
      waitlistId: z.string().uuid().optional(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context as any;
    const email = claims?.email ?? null;
    const now = new Date();
    const expires = new Date(now.getTime() + LOCK_MINUTES * 60 * 1000);

    const { error } = await supabase
      .from("seats")
      .update({
        status: "locked",
        locked_by: data.phone,
        locked_at: now.toISOString(),
        expires_at: expires.toISOString(),
      })
      .eq("id", data.seatId);
    if (error) throw error;

    await logActivity(supabase, email, userId, "lock", {
      seat_id: data.seatId,
      show_id: data.showId,
      target_phone: data.phone,
      details: { expires_at: expires.toISOString() },
    });

    fireSmsBg(
      data.phone,
      `SeatSync: Admin locked seat ${data.seatId} for you. Confirm within ${LOCK_MINUTES} min.`,
    );

    return { ok: true, expires_at: expires.toISOString() };
  });

// ------- BOOK SEAT -------
export const bookSeat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      seatId: z.string(),
      showId: z.string().nullable(),
      phone: z.string().nullable(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context as any;
    const email = claims?.email ?? null;

    const { error } = await supabase
      .from("seats")
      .update({
        status: "booked",
        locked_by: data.phone,
        locked_at: null,
        expires_at: null,
      })
      .eq("id", data.seatId);
    if (error) throw error;

    if (data.phone) {
      await supabase
        .from("waitlist")
        .delete()
        .eq("seat_id", data.seatId)
        .eq("phone", data.phone);
    }

    await logActivity(supabase, email, userId, "book", {
      seat_id: data.seatId,
      show_id: data.showId,
      target_phone: data.phone,
    });

    if (data.phone) {
      fireSmsBg(
        data.phone,
        `SeatSync: Seat ${data.seatId} is CONFIRMED for you. See you at the show!`,
      );
    }
    return { ok: true };
  });

// ------- RELEASE SEAT -------
export const releaseSeatAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      seatId: z.string(),
      showId: z.string().nullable(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context as any;
    const email = claims?.email ?? null;

    const { error } = await supabase
      .from("seats")
      .update({
        status: "available",
        locked_by: null,
        locked_at: null,
        expires_at: null,
      })
      .eq("id", data.seatId);
    if (error) throw error;

    // Notify next in queue
    const { data: next } = await supabase
      .from("waitlist")
      .select("*")
      .eq("seat_id", data.seatId)
      .eq("notified", false)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (next) {
      await supabase.from("waitlist").update({ notified: true }).eq("id", next.id);
      fireSmsBg(
        next.phone,
        `SeatSync: Seat ${data.seatId} is now FREE. You were #${next.position} in queue — grab it fast.`,
      );
    }

    await logActivity(supabase, email, userId, "release", {
      seat_id: data.seatId,
      show_id: data.showId,
      target_phone: next?.phone ?? null,
      details: { notified_next: !!next },
    });

    return { ok: true, notified: next?.phone ?? null };
  });

// ------- REMOVE WAITLIST ENTRY -------
export const removeWaitlistEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ id: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context as any;
    const email = claims?.email ?? null;

    const { data: entry } = await supabase
      .from("waitlist")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    const { error } = await supabase.from("waitlist").delete().eq("id", data.id);
    if (error) throw error;

    await logActivity(supabase, email, userId, "waitlist_remove", {
      seat_id: entry?.seat_id ?? null,
      target_phone: entry?.phone ?? null,
      details: { position: entry?.position },
    });
    return { ok: true };
  });

// ------- LIST WAITLIST -------
export const listWaitlist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .order("joined_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

// ------- LIST ACTIVITY -------
export const listActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase
      .from("admin_activity")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data ?? [];
  });
