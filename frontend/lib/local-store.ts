export type RecentItem = {
  slug: string;
  title: string;
  showtime: string;
  theatre?: string;
};

const RECENT_KEY = "seatsync-recently-viewed";
const NOTIFY_KEY = "seatsync-notifications";

export function getRecentlyViewed(): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as RecentItem[]) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(item: RecentItem) {
  if (typeof window === "undefined") return;
  try {
    const list = getRecentlyViewed().filter((r) => r.slug !== item.slug);
    localStorage.setItem(RECENT_KEY, JSON.stringify([item, ...list].slice(0, 12)));
  } catch {
    /* ignore */
  }
}

export function getNotificationsPref(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(NOTIFY_KEY) !== "off";
}

export function setNotificationsPref(on: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIFY_KEY, on ? "on" : "off");
}
