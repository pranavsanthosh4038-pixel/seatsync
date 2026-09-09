import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, MapPin, Menu, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ThemeToggle, getTheme, setTheme } from "@/components/ThemeToggle";
import {
  getNotificationsPref,
  getRecentlyViewed,
  setNotificationsPref,
  type RecentItem,
} from "@/lib/local-store";
import { CITIES, cityByKey, moviesForCity, showtimesFor, type CityKey } from "@/lib/movies";
import { eventsFor, venueFor } from "@/lib/events";

type Suggestion = {
  key: string;
  title: string;
  subtitle: string;
  image: string;
  href?: { showId: string };
};

export function SiteHeader({
  city,
  onCityChange,
  query,
  onQueryChange,
  onCategoryChange,
}: {
  city?: CityKey;
  onCityChange?: (c: CityKey) => void;
  query?: string;
  onQueryChange?: (q: string) => void;
  onCategoryChange?: (c: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState(query ?? "");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const activeCity = cityByKey(city ?? "bengaluru");

  useEffect(() => setTerm(query ?? ""), [query]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pool = useMemo<Suggestion[]>(() => {
    const key = activeCity.key;
    const movies = moviesForCity(key).map((m) => {
      const first = showtimesFor(m, key)[0];
      return {
        key: `m-${m.slug}`,
        title: m.title,
        subtitle: `${m.genre} · ${m.duration}`,
        image: m.poster,
        href: first ? { showId: first.id } : undefined,
      };
    });
    const events = eventsFor(key).map((e) => ({
      key: `e-${e.slug}`,
      title: e.title,
      subtitle: `${e.tag} · ${venueFor(e, key)}`,
      image: e.image,
    }));
    return [...movies, ...events];
  }, [activeCity.key]);

  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return pool.slice(0, 6);
    return pool
      .filter((s) => (s.title + " " + s.subtitle).toLowerCase().includes(q))
      .slice(0, 8);
  }, [term, pool]);

  const commit = (value: string) => {
    setTerm(value);
    onQueryChange?.(value);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center gap-3">
        <button
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
          className="w-9 h-9 shrink-0 rounded-full border border-border bg-surface flex items-center justify-center text-foreground hover:bg-surface-2 transition-colors"
        >
          <Menu size={18} />
        </button>

        <Link to="/" className="text-xl font-bold tracking-tight text-foreground shrink-0">
          Seat<span className="text-primary">Sync</span>
        </Link>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative" ref={searchRef}>
          <div
            className={`flex items-center gap-2 rounded-full border border-border bg-surface transition-all ${
              searchOpen ? "w-[min(60vw,340px)] px-4" : "w-9 justify-center"
            } h-9`}
          >
            <button
              aria-label="Search movies and events"
              onClick={() => setSearchOpen(true)}
              className="text-foreground"
            >
              <Search size={16} />
            </button>
            {searchOpen && (
              <input
                autoFocus
                value={term}
                onChange={(e) => commit(e.target.value)}
                placeholder="Search movies, events, plays"
                className="w-full bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              />
            )}
            {searchOpen && term && (
              <button aria-label="Clear search" onClick={() => commit("")}>
                <X size={14} className="text-muted-foreground" />
              </button>
            )}
          </div>

          {searchOpen && (
            <div className="absolute right-0 mt-2 w-[min(90vw,380px)] rounded-2xl bg-card border border-border shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)] p-2 z-50 max-h-[70vh] overflow-y-auto">
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {term.trim() ? "Results" : "Recommended for you"}
              </p>
              {results.length === 0 && (
                <p className="px-3 py-4 text-sm text-muted-foreground">
                  Nothing matches “{term}” in {activeCity.name}.
                </p>
              )}
              {results.map((r) => (
                <button
                  key={r.key}
                  onClick={() => {
                    commit(r.title);
                    setSearchOpen(false);
                    if (r.href) navigate({ to: "/show/$showId", params: r.href });
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface text-left transition-colors"
                >
                  <img
                    src={r.image}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget;
                      const fb = `https://placehold.co/300x450/111111/ffffff?text=${encodeURIComponent(r.title)}`;
                      if (img.src !== fb) img.src = fb;
                    }}
                    className="w-10 h-14 rounded-lg object-cover shrink-0"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground truncate">
                      {r.title}
                    </span>
                    <span className="block text-xs text-muted-foreground truncate">
                      {r.subtitle}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* City picker — right, next to search */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-surface border border-border text-sm font-medium text-foreground hover:bg-surface-2 transition-colors"
          >
            <MapPin size={14} className="text-primary" />
            <span className="hidden sm:inline">{activeCity.name}</span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>

          {open && (
            <div
              role="listbox"
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)] p-1.5 z-50"
            >
              {CITIES.map((c) => (
                <button
                  key={c.key}
                  role="option"
                  aria-selected={c.key === activeCity.key}
                  onClick={() => {
                    onCityChange?.(c.key);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                    c.key === activeCity.key
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-surface"
                  }`}
                >
                  <div>{c.name}</div>
                  <div className="text-[11px] text-muted-foreground">{c.localLanguage} prints</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <ThemeToggle />
      </div>

      {menuOpen && (
        <SideMenu
          onClose={() => setMenuOpen(false)}
          cityName={activeCity.name}
          onCategoryChange={onCategoryChange}
        />
      )}
    </header>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <button
            aria-label="Close"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground"
          >
            <X size={14} />
          </button>
        </div>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

function AdminPinModal({ onClose }: { onClose: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const locked = attempts >= 3;

  const submit = () => {
    if (locked) return;
    if (pin === "2533") {
      onClose();
      window.open("/admin", "_blank", "noopener");
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setError(next >= 3 ? "Too many attempts. Contact your administrator." : "Incorrect PIN");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <Modal title="Admin Access" onClose={onClose}>
      <p className="text-sm text-muted-foreground">Enter your 4-digit PIN to continue</p>
      <input
        autoFocus
        type="password"
        value={pin}
        inputMode="numeric"
        maxLength={4}
        disabled={locked}
        onChange={(e) => {
          setPin(e.target.value.replace(/\D/g, ""));
          setError(null);
        }}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="••••"
        className={`w-full text-center text-3xl tracking-[0.6em] font-bold py-4 rounded-xl bg-surface border ${
          error ? "border-primary" : "border-border"
        } text-foreground outline-none disabled:opacity-50 ${shake ? "animate-shake" : ""}`}
      />
      {error && <p className="text-primary text-sm font-semibold">{error}</p>}
      <button
        onClick={submit}
        disabled={locked}
        className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50"
      >
        Continue
      </button>
      <button
        onClick={onClose}
        className="w-full text-sm font-semibold text-muted-foreground underline underline-offset-4"
      >
        Cancel
      </button>
    </Modal>
  );
}

function scrollToGrid() {
  requestAnimationFrame(() => {
    const el = document.getElementById("browse-grid");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const [dark, setDark] = useState(false);
  const [notify, setNotify] = useState(true);

  useEffect(() => {
    setDark(getTheme() === "dark");
    setNotify(getNotificationsPref());
  }, []);

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`w-11 h-6 shrink-0 rounded-full transition-colors ${on ? "bg-primary" : "bg-border"}`}
    >
      <span
        className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-[22px]" : "translate-x-[2px]"}`}
      />
    </button>
  );

  return (
    <Modal title="Settings" onClose={onClose}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-foreground">Dark Mode</span>
        <Toggle
          on={dark}
          onToggle={() => {
            const next = !dark;
            setDark(next);
            setTheme(next ? "dark" : "light");
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-foreground">
          <span className="block font-medium">Notifications</span>
          <span className="block text-xs text-muted-foreground">
            Get notified when your waitlisted seat opens up
          </span>
        </span>
        <Toggle
          on={notify}
          onToggle={() => {
            const next = !notify;
            setNotify(next);
            setNotificationsPref(next);
          }}
        />
      </div>
    </Modal>
  );
}

function RecentlyViewedModal({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<RecentItem[]>([]);
  useEffect(() => setItems(getRecentlyViewed()), []);
  return (
    <Modal title="Recently Viewed" onClose={onClose}>
      {items.length === 0 ? (
        <p>You haven&apos;t viewed any movies yet in this session.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((r) => (
            <li
              key={r.slug}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-surface border border-border"
            >
              <span className="text-sm font-semibold text-foreground truncate">{r.title}</span>
              <span className="text-xs text-muted-foreground shrink-0">{r.showtime}</span>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

function SideMenu({
  onClose,
  cityName,
  onCategoryChange,
}: {
  onClose: () => void;
  cityName: string;
  onCategoryChange?: (c: string) => void;
}) {
  const [modal, setModal] = useState<
    null | "pin" | "help" | "about" | "waitlist" | "bookings" | "recent" | "settings"
  >(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const rowClass =
    "w-full h-10 flex items-center gap-4 px-4 text-left text-sm font-medium text-foreground transition-colors hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f]";

  const Row = ({
    emoji,
    label,
    onClick,
  }: {
    emoji: string;
    label: string;
    onClick?: () => void;
  }) => (
    <button onClick={onClick} className={rowClass}>
      <span className="w-5 text-[20px] leading-none text-center">{emoji}</span>
      <span className="flex-1">{label}</span>
    </button>
  );

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="pt-4 pb-1 px-4 text-xs uppercase tracking-[0.5px] text-[#606060] dark:text-[#aaaaaa]">
      {children}
    </p>
  );

  const Divider = () => (
    <div className="my-2 border-t border-[#e5e5e5] dark:border-[#3f3f3f]" />
  );

  const navItems = [
    { emoji: "🏠", label: "Home" },
    { emoji: "🎬", label: "Movies" },
    { emoji: "🎵", label: "Events" },
    { emoji: "🏏", label: "Sports" },
    { emoji: "🍽️", label: "Dining" },
    { emoji: "🎭", label: "Plays" },
  ];

  const handleNav = (label: string) => {
    onClose();
    if (label === "Home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    onCategoryChange?.(label);
    scrollToGrid();
  };

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        className="fixed inset-0 z-[9998] bg-black/50"
      />
      <aside
        onClick={(e) => e.stopPropagation()}
        style={{ transition: "transform 0.25s ease" }}
        className="fixed left-0 top-0 h-screen w-[280px] max-w-[86vw] z-[9999] bg-white dark:bg-[#212121] overflow-y-auto animate-slide-in-left"
      >
        <div className="h-16 flex items-center gap-4 px-4">
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-foreground hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors"
          >
            <Menu size={18} />
          </button>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Seat<span className="text-primary">Sync</span>
          </span>
        </div>

        <nav className="pb-4">
          {navItems.map((n) => (
            <Row key={n.label} emoji={n.emoji} label={n.label} onClick={() => handleNav(n.label)} />
          ))}

          <Divider />
          <SectionLabel>You</SectionLabel>
          <Row emoji="📋" label="My Waitlist" onClick={() => setModal("waitlist")} />
          <Row emoji="🎟️" label="My Bookings" onClick={() => setModal("bookings")} />
          <Row emoji="🕐" label="Recently Viewed" onClick={() => setModal("recent")} />

          <Divider />
          <SectionLabel>More from SeatSync</SectionLabel>
          <Row emoji="🔐" label="Admin Panel" onClick={() => setModal("pin")} />
          <Row emoji="❓" label="Help & Support" onClick={() => setModal("help")} />
          <Row emoji="ℹ️" label="About SeatSync" onClick={() => setModal("about")} />
          <Row emoji="⚙️" label="Settings" onClick={() => setModal("settings")} />

          <Divider />
          <p className="px-4 py-2 text-[11px] text-[#606060] dark:text-[#aaaaaa]">
            Location · {cityName}
          </p>
        </nav>
      </aside>


      {modal === "pin" && <AdminPinModal onClose={() => setModal(null)} />}
      {modal === "waitlist" && (
        <Modal title="My Waitlist" onClose={() => setModal(null)}>
          <p>
            You have no active waitlist entries yet. Browse movies and join a waitlist to see your
            entries here.
          </p>
        </Modal>
      )}
      {modal === "bookings" && (
        <Modal title="My Bookings" onClose={() => setModal(null)}>
          <p>No confirmed bookings yet.</p>
        </Modal>
      )}
      {modal === "recent" && <RecentlyViewedModal onClose={() => setModal(null)} />}
      {modal === "settings" && <SettingsModal onClose={() => setModal(null)} />}
      {modal === "help" && (
        <Modal title="Need help?" onClose={() => setModal(null)}>
          <p>Email us: help@seatsync.in</p>
          <p>SeatSync is a Digital Business Systems project</p>
          <p>CHRIST (Deemed to be University), Bengaluru · Batch 2025–2028</p>
          <p>Faculty Mentor: Dr. Chandravesh Chaudhari</p>
          <button
            onClick={() => setModal(null)}
            className="mt-2 w-full py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm"
          >
            Close
          </button>
        </Modal>
      )}
      {modal === "about" && (
        <Modal title="About SeatSync" onClose={() => setModal(null)}>
          <p>
            SeatSync is an intelligent dynamic waitlisting system built to solve BookMyShow's seat
            cancellation and load management problem.
          </p>
          <p>
            Built by: Apeksha Vemali · Ardra Jyothikumar · Cattamanchi Parthiv Reddy · Pranav ·
            Roopika Yallamelli
          </p>
          <p>Course: Digital Business Systems (ECD223-3)</p>
          <p>Faculty: Dr. Chandravesh Chaudhari</p>
          <p>Version: v1.0 · July 2026</p>
          <button
            onClick={() => setModal(null)}
            className="mt-2 w-full py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm"
          >
            Close
          </button>
        </Modal>
      )}
    </>
  );
}
