import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Fixed demo credentials the operator types.
const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "12345";

// Internal mapping to a real Supabase account (Supabase requires ≥ 6 char passwords),
// so all authenticated server functions keep working transparently.
const INTERNAL_EMAIL = "admin@seatsync.local";
const INTERNAL_PASSWORD = "SeatSyncAdmin!2026";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "SeatSync Admin // Sign In" },
      { name: "description", content: "Staff sign-in for SeatSync control room." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

async function signInOrProvision() {
  const first = await supabase.auth.signInWithPassword({
    email: INTERNAL_EMAIL,
    password: INTERNAL_PASSWORD,
  });
  if (!first.error) return;
  // Provision the demo account on first ever run, then sign in.
  const signup = await supabase.auth.signUp({
    email: INTERNAL_EMAIL,
    password: INTERNAL_PASSWORD,
    options: { emailRedirectTo: window.location.origin + "/admin" },
  });
  if (signup.error) throw signup.error;
  const second = await supabase.auth.signInWithPassword({
    email: INTERNAL_EMAIL,
    password: INTERNAL_PASSWORD,
  });
  if (second.error) throw second.error;
}

function AuthPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().toLowerCase() !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
      toast.error("Invalid credentials");
      return;
    }
    setBusy(true);
    try {
      await signInOrProvision();
      toast.success("Access granted");
      navigate({ to: "/admin" });
    } catch (err: any) {
      toast.error(err?.message ?? "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="admin-scope min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(ellipse at top, #eaf2fb 0%, #f4f7fc 45%, #eef3fb 100%)",
      }}
    >
      <div className="w-full max-w-sm pastel-card p-7">
        <div className="text-center mb-6">
          <div
            className="inline-block px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-widest"
            style={{ background: "#eaf2fb", color: "#4a5b74", border: "1px solid #d7e2f0" }}
          >
            Admin // Demo
          </div>
          <h1
            className="mt-4 text-2xl tracking-widest"
            style={{ color: "#2a3547", fontFamily: "var(--font-display)" }}
          >
            SEATSYNC
          </h1>
          <p className="mt-1 text-xs" style={{ color: "#6b7a92" }}>
            Sign in to the control room
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: "#6b7a92" }}
            >
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="admin"
              className="w-full mt-1 px-3 py-2 pastel-inset text-sm focus:outline-none"
              style={{ color: "#2a3547" }}
            />
          </div>
          <div>
            <label
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: "#6b7a92" }}
            >
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="12345"
              className="w-full mt-1 px-3 py-2 pastel-inset text-sm focus:outline-none"
              style={{ color: "#2a3547" }}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 pastel-btn-blue font-mono text-xs uppercase tracking-[0.25em] disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign In"}
          </button>

          <div
            className="text-center font-mono text-[10px] uppercase tracking-widest"
            style={{ color: "#8a97ad" }}
          >
            Demo credentials: admin / 12345
          </div>
        </form>

        <div className="mt-6 pt-4 text-center" style={{ borderTop: "1px solid #e4ecf6" }}>
          <Link
            to="/"
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: "#6b7a92" }}
          >
            ← Public site
          </Link>
        </div>
      </div>
    </div>
  );
}
