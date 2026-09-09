import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, "Phone must be a 10-digit number"),
  message: z.string().min(1).max(320),
});

// DEMO: override every outbound SMS to a fixed test recipient.
const TEST_RECIPIENT = "8590482082";

export const sendSms = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    const TWILIO_API_KEY = process.env.TWILIO_API_KEY;
    const FROM = process.env.TWILIO_FROM_NUMBER;

    if (!LOVABLE_API_KEY || !TWILIO_API_KEY || !FROM) {
      console.error("[sendSms] Missing env", {
        hasLovable: !!LOVABLE_API_KEY,
        hasTwilio: !!TWILIO_API_KEY,
        hasFrom: !!FROM,
      });
      return { ok: false, error: "SMS not configured" as const };
    }

    const to = `+91${TEST_RECIPIENT}`;
    const body = new URLSearchParams({
      To: to,
      From: FROM,
      Body: data.message,
    });

    const res = await fetch(
      "https://connector-gateway.lovable.dev/twilio/Messages.json",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": TWILIO_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[sendSms] Twilio failed [${res.status}]: ${errText}`);
      return { ok: false, error: `Twilio ${res.status}` as const };
    }

    const json = (await res.json()) as { sid?: string };
    return { ok: true, sid: json.sid };
  });
