import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Map,
  ClipboardList,
  ScrollText,
  Lock,
  CheckCircle2,
  Megaphone,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { AiChatWidget } from "@/components/admin/AiChatWidget";
import { ThemeToggle } from "@/components/ThemeToggle";

const MAIN_SITE = "https://seat-sync-web.lovable.app";

type Item = {
  label: string;
  icon: typeof LayoutDashboard;
  to?: string;
  href?: string;
  action?: "controls" | "settings";
  match?: (path: string) => boolean;
};

const SECTIONS: { label?: string; items: Item[] }[] = [
  {
    items: [
      { label: "Dashboard", icon: LayoutDashboard, to: "/admin", match: (p) => p === "/admin" },
      {
        label: "Live Seat Map",
        icon: Map,
        to: "/admin",
        match: (p) => p.startsWith("/admin/shows"),
      },
      { label: "Waitlist Manager", icon: ClipboardList, to: "/admin/waitlist" },
      { label: "Booking Logs", icon: ScrollText, to: "/admin/activity" },
    ],
  },
  {
    label: "Controls",
    items: [
      { label: "Lock a Seat", icon: Lock, action: "controls" },
      { label: "Release a Seat", icon: CheckCircle2, action: "controls" },
      { label: "Notify Queue", icon: Megaphone, action: "controls" },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Settings", icon: Settings, action: "settings" },
      { label: "View Main Site", icon: ExternalLink, href: MAIN_SITE },
    ],
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const goControls = async () => {
    if (pathname !== "/admin") await navigate({ to: "/admin" });
    setTimeout(() => {
      document.getElementById("admin-controls")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  };

  const renderItem = (item: Item) => {
    const Icon = item.icon;
    const active = item.to
      ? item.match
        ? item.match(pathname)
        : pathname === item.to
      : false;
    const cls = `admin-nav w-full text-left ${active ? "admin-nav-active" : ""}`;
    const inner = (
      <>
        <Icon size={18} className="shrink-0" />
        <span>{item.label}</span>
      </>
    );

    if (item.href) {
      return (
        <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className={cls}>
          {inner}
        </a>
      );
    }
    if (item.to) {
      return (
        <Link key={item.label} to={item.to} className={cls} onClick={() => setMobileNav(false)}>
          {inner}
        </Link>
      );
    }
    return (
      <button
        key={item.label}
        className={cls}
        onClick={() => {
          setMobileNav(false);
          if (item.action === "settings") setSettingsOpen(true);
          else void goControls();
        }}
      >
        {inner}
      </button>
    );
  };

  const sidebar = (
    <nav className="flex h-full flex-col overflow-y-auto py-2">
      {SECTIONS.map((section, i) => (
        <div key={i}>
          {i > 0 && <div className="my-2 border-t border-border" />}
          {section.label && <div className="admin-section-label">{section.label}</div>}
          {section.items.map(renderItem)}
        </div>
      ))}
      <div className="mt-auto px-4 pb-3 pt-4">
        <div className="text-[11px] text-muted-foreground">Signed in as</div>
        <div className="truncate text-[12px] text-foreground">{email ?? "—"}</div>
        <button
          onClick={signOut}
          className="admin-btn admin-btn-grey mt-2 flex items-center gap-1.5"
        >
          <LogOut size={12} /> Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="admin-scope min-h-screen bg-background text-foreground transition-colors duration-300">
      <header
        className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-border bg-background px-4 md:px-6"
        style={{ height: 60 }}
      >
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-foreground"
            aria-label="Toggle navigation"
            onClick={() => setMobileNav((v) => !v)}
          >
            <Menu size={20} />
          </button>
          <Link to="/admin" className="flex items-center">
            <span className="text-[17px] font-bold text-foreground">SeatSync</span>
            <span
              className="ml-2 bg-primary text-primary-foreground"
              style={{ padding: "3px 6px", borderRadius: 20, fontSize: 12, lineHeight: 1.2 }}
            >
              Admin
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <a
            href={MAIN_SITE}
            target="_blank"
            rel="noreferrer"
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            ← Main Site
          </a>
        </div>
      </header>

      <aside
        className="fixed left-0 z-30 hidden border-r border-border bg-background md:block"
        style={{ top: 60, width: 240, height: "calc(100vh - 60px)" }}
      >
        {sidebar}
      </aside>

      {mobileNav && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileNav(false)}
          />
          <aside
            className="fixed left-0 z-50 border-r border-border bg-background md:hidden"
            style={{ top: 60, width: 240, height: "calc(100vh - 60px)" }}
          >
            {sidebar}
          </aside>
        </>
      )}

      <main style={{ paddingTop: 60 }} className="md:pl-[240px]">
        {children}
      </main>

      {settingsOpen && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-border bg-card p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 text-base font-bold text-foreground">Settings</div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <div className="text-sm text-foreground">Dark mode</div>
              <ThemeToggle />
            </div>
            <div className="mt-3 text-[12px] text-muted-foreground">
              Theme preference is saved to this browser.
            </div>
            <button
              onClick={() => setSettingsOpen(false)}
              className="admin-btn admin-btn-red mt-4 w-full py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <AiChatWidget />
    </div>
  );
}
