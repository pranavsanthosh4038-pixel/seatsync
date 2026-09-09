import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(10),
});

const SYSTEM_PROMPT = `You are SeatSync AI, an intelligent assistant built into the SeatSync admin dashboard. SeatSync is a dynamic seat waitlisting system for BookMyShow-style movie ticketing in India.

You help admins with:
- Understanding seat status (available, locked, confirmed)
- Managing the waitlist queue (FIFO ordering by join time)
- Explaining the business algorithm: when a seat is released, the system checks the waitlist table, finds the entry with the lowest position number for that seat_id where notified = false, sends an SMS via Twilio to that user's phone number, and marks notified = true
- Explaining the tech stack: React frontend on Lovable, Supabase PostgreSQL database with Realtime WebSockets, Twilio for SMS notifications, Retool for admin functions
- Answering questions about scalability, security, and the system architecture
- Explaining database tables: seats (id, row_label, seat_number, status, locked_by, locked_at, expires_at) and waitlist (id, seat_id, phone, position, joined_at, notified)
- Helping admins understand what actions to take when seats are stuck in locked state, waitlist entries pile up, or SMS notifications fail

Keep answers concise, friendly and technically accurate. You are helping university students demonstrate their Digital Business Systems project at CHRIST (Deemed to be University), Bengaluru.`;

export const askSeatSyncAi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "AI is not configured." };
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.6-sol",
        instructions: SYSTEM_PROMPT,
        max_output_tokens: 700,
        input: data.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error(`[askSeatSyncAi] gateway ${res.status}: ${detail}`);
      if (res.status === 429) {
        return { ok: false as const, error: "Too many requests. Please wait a moment and try again." };
      }
      if (res.status === 402) {
        return { ok: false as const, error: "AI credits are exhausted for this workspace." };
      }
      return { ok: false as const, error: "Sorry, I'm having trouble connecting. Try again." };
    }

    const json = (await res.json()) as {
      output_text?: string;
      output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
    };

    const text =
      json.output_text?.trim() ||
      (json.output ?? [])
        .flatMap((item) => item.content ?? [])
        .filter((c) => c.type === "output_text" && c.text)
        .map((c) => c.text as string)
        .join("\n")
        .trim();

    if (!text) {
      return { ok: false as const, error: "Sorry, I'm having trouble connecting. Try again." };
    }

    return { ok: true as const, reply: text };
  });
