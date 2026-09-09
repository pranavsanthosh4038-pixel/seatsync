import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  cityByKey,
  languagesFor,
  moviesForCity,
  showtimesFor,
  type CityKey,
  type Movie,
} from "@/lib/movies";
import { eventsFor, venueFor, type EventCategory, type LiveEvent } from "@/lib/events";
import { getTotalWaitlistCount } from "@/lib/seats";
import { SiteHeader } from "@/components/SiteHeader";
import { addRecentlyViewed } from "@/lib/local-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SeatSync — Movie & Event Waitlists for Sold-Out Shows in India" },
      {
        name: "description",
        content:
          "Every show is sold out. Join the waitlist for the exact seat you want across Bengaluru, Delhi, Mumbai, Hyderabad, Chennai and Kochi — movies, concerts, plays and more.",
      },
      { property: "og:title", content: "SeatSync — Movie & Event Waitlists Across India" },
      {
        property: "og:description",
        content:
          "Join the waitlist for sold-out movies, concerts and events in six Indian cities and get notified the second a seat frees up.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MovieBrowser,
});

const CATEGORIES = ["Movies", "Events", "Concerts", "Plays", "Sports", "Comedy"] as const;
type Category = (typeof CATEGORIES)[number];

function MovieBrowser() {
  const [category, setCategory] = useState<Category>("Movies");
  const [city, setCity] = useState<CityKey>("bengaluru");
  const [language, setLanguage] = useState("All");
  const [query, setQuery] = useState("");
  const { data: waitTotal = 0 } = useQuery({
    queryKey: ["waitlist-total"],
    queryFn: getTotalWaitlistCount,
    refetchInterval: 5000,
  });

  const cityInfo = cityByKey(city);
  const isMovies = category === "Movies";

  const cityMovies = useMemo(() => moviesForCity(city), [city]);
  const cityEvents = useMemo(
    () => (isMovies ? [] : eventsFor(city, category as EventCategory)),
    [city, category, isMovies],
  );

  const languages = useMemo(() => {
    const set = new Set<string>();
    if (isMovies) {
      cityMovies.forEach((m) =>
        languagesFor(m, city)
          .split(" · ")
          .forEach((l) => set.add(l)),
      );
    } else {
      cityEvents.forEach((e) => e.languages.forEach((l) => set.add(l)));
    }
    return ["All", ...Array.from(set).sort()];
  }, [cityMovies, cityEvents, city, isMovies]);

  const q = query.trim().toLowerCase();

  const movies = cityMovies.filter(
    (m) =>
      (language === "All" || languagesFor(m, city).includes(language)) &&
      (!q || (m.title + " " + m.genre).toLowerCase().includes(q)),
  );

  const events = cityEvents.filter(
    (e) =>
      (language === "All" || e.languages.includes(language)) &&
      (!q || (e.title + " " + e.tag + " " + venueFor(e, city)).toLowerCase().includes(q)),
  );

  const empty = isMovies ? movies.length === 0 : events.length === 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader
        city={city}
        onCityChange={setCity}
        query={query}
        onQueryChange={setQuery}
        onCategoryChange={(c) => {
          if ((CATEGORIES as readonly string[]).includes(c)) {
            setCategory(c as Category);
            setLanguage("All");
          }
        }}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Hero */}
        <section className="pt-12 pb-8">
          <p className="label-caps text-xs text-primary mb-3">{cityInfo.name} · Tonight</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight max-w-2xl">
            What&apos;s showing tonight
          </h1>
          <p className="mt-3 text-muted-foreground text-base max-w-xl">
            Every movie, concert and live show below is sold out in {cityInfo.name}. Pick a slot,
            tap the seat you want, and join the queue — we&apos;ll text you the moment it frees up.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-sm">
            <span className="w-2 h-2 rounded-full bg-[#2ecc71]" />
            <span className="text-muted-foreground">People in queue right now</span>
            <span className="font-bold text-foreground">{waitTotal}</span>
          </div>
        </section>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">
          {CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                onClick={() => {
                  setCategory(c);
                  setLanguage("All");
                }}
                className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-surface text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Language filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-6 -mx-1 px-1">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground pr-1">
            Language
          </span>
          {languages.map((l) => {
            const active = l === language;
            return (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "bg-surface text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {l}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {empty ? (
          <p id="browse-grid" className="py-16 text-center text-muted-foreground">
            Nothing in {category} matching your filters in {cityInfo.name}.
          </p>
        ) : (
          <section id="browse-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
            {isMovies
              ? movies.map((m, idx) => (
                  <MovieCard key={m.slug} movie={m} city={city} waitBase={idx * 3 + 7} />
                ))
              : events.map((e, idx) => (
                  <EventCard key={e.slug} event={e} city={city} waiting={idx * 4 + 12} />
                ))}
          </section>
        )}
      </main>

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 text-sm text-muted-foreground">
          SeatSync · {cityInfo.name} · Smart cancellation &amp; waitlist management
        </div>
      </footer>
    </div>
  );
}

function EventCard({
  event,
  city,
  waiting,
}: {
  event: LiveEvent;
  city: CityKey;
  waiting: number;
}) {
  return (
    <article className="card-soft card-lift overflow-hidden">
      <div className="h-44 relative overflow-hidden">
        <img
          src={event.image}
          alt={`${event.title} artwork`}
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget;
            const fallback = `https://placehold.co/300x450/111111/ffffff?text=${encodeURIComponent(event.title)}`;
            if (img.src !== fallback) img.src = fallback;
          }}
          width={1024}
          height={640}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.75) 100%)",
          }}
        />
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-[#1c1c1c] text-[11px] font-semibold">
          {event.category}
        </span>
        <h3 className="absolute bottom-3 left-4 right-4 text-xl font-bold text-white">
          {event.title}
        </h3>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{event.tag}</span>
          <span className="text-muted-foreground">{event.price}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{event.languages.join(" · ")}</p>

        <div className="mt-4 flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-surface border border-border">
          <div className="min-w-0">
            <div className="text-sm font-semibold">
              {event.date} · {event.time}
            </div>
            <div className="text-xs text-muted-foreground truncate">{venueFor(event, city)}</div>
          </div>
          <span className="shrink-0 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
            {waiting} waiting
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Sold out · waitlist opens at the venue</p>
      </div>
    </article>
  );
}

function MovieCard({
  movie,
  city,
  waitBase,
}: {
  movie: Movie;
  city: CityKey;
  waitBase: number;
}) {
  const [open, setOpen] = useState(false);
  const showtimes = showtimesFor(movie, city);
  const shown = open ? showtimes : showtimes.slice(0, 2);

  return (
    <article className="card-soft card-lift overflow-hidden">
      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          src={movie.poster}
          alt={`${movie.title} poster artwork`}
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget;
            const fallback = `https://placehold.co/300x450/111111/ffffff?text=${encodeURIComponent(movie.title)}`;
            if (img.src !== fallback) img.src = fallback;
          }}
          width={512}
          height={768}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.75) 100%)" }}
        />
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-[#1c1c1c] text-[11px] font-semibold">
          {movie.rating}
        </span>
        {movie.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wide">
            {movie.badge}
          </span>
        )}
        <h3 className="absolute bottom-3 left-4 right-4 text-xl font-bold text-white">
          {movie.title}
        </h3>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{movie.genre}</span>
          <span className="text-muted-foreground">{movie.duration}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{languagesFor(movie, city)}</p>

        <div className="mt-4 space-y-2">
          {shown.map((st, i) => {
            const waiting = waitBase + i * 2;
            return (
              <Link
                key={st.id}
                to="/show/$showId"
                params={{ showId: st.id }}
                onClick={() =>
                  addRecentlyViewed({
                    slug: movie.slug,
                    title: movie.title,
                    showtime: st.time,
                    theatre: st.theatre,
                  })
                }
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-surface border border-border hover:border-primary transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{st.time}</div>
                  <div className="text-xs text-muted-foreground truncate">{st.theatre}</div>
                </div>
                <span className="shrink-0 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                  {waiting} waiting
                </span>
              </Link>
            );
          })}
        </div>

        {showtimes.length > 2 && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="mt-3 text-sm font-semibold text-primary"
          >
            {open ? "Show less" : `+${showtimes.length - 2} more showtimes`}
          </button>
        )}
      </div>
    </article>
  );
}
