import imgConcert from "@/assets/event-concert.jpg";
import imgComedy from "@/assets/event-comedy.jpg";
import imgPlay from "@/assets/event-play.jpg";
import imgSports from "@/assets/event-sports.jpg";
import { cityByKey, type CityKey } from "@/lib/movies";

export type EventCategory = "Events" | "Concerts" | "Plays" | "Sports" | "Comedy";

export type LiveEvent = {
  slug: string;
  title: string;
  category: EventCategory;
  tag: string;
  date: string;
  time: string;
  price: string;
  image: string;
  languages: string[];
  cities: CityKey[];
  venues: Partial<Record<CityKey, string>>;
};

const ALL: CityKey[] = ["bengaluru", "delhi", "mumbai", "hyderabad", "chennai", "kochi"];

export const EVENTS: LiveEvent[] = [
  {
    slug: "arijit-singh-live",
    title: "ARIJIT SINGH LIVE IN CONCERT",
    category: "Concerts",
    tag: "Bollywood / Playback",
    date: "Sat, 15 Aug",
    time: "7:00 PM",
    price: "From ₹2,499",
    image: imgConcert,
    languages: ["Hindi", "English"],
    cities: ALL,
    venues: {
      bengaluru: "Nice Grounds, Bengaluru",
      delhi: "JLN Stadium, Delhi",
      mumbai: "MMRDA Grounds, BKC",
      hyderabad: "Gachibowli Stadium",
      chennai: "YMCA Grounds, Nandanam",
      kochi: "Marine Drive Grounds",
    },
  },
  {
    slug: "anirudh-hukum-tour",
    title: "ANIRUDH — HUKUM ARENA TOUR",
    category: "Concerts",
    tag: "Kollywood / EDM",
    date: "Fri, 21 Aug",
    time: "8:00 PM",
    price: "From ₹1,999",
    image: imgConcert,
    languages: ["Tamil", "Telugu", "English"],
    cities: ["chennai", "bengaluru", "hyderabad", "kochi", "mumbai"],
    venues: {
      chennai: "Island Grounds, Chennai",
      bengaluru: "Manpho Convention Centre",
      hyderabad: "HITEX Exhibition Grounds",
      kochi: "Bolgatty Convention Centre",
      mumbai: "Jio World Garden",
    },
  },
  {
    slug: "zakir-khan-standup",
    title: "ZAKIR KHAN — HAQ SE SINGLE",
    category: "Comedy",
    tag: "Stand-up Comedy",
    date: "Sun, 16 Aug",
    time: "6:30 PM",
    price: "From ₹799",
    image: imgComedy,
    languages: ["Hindi"],
    cities: ALL,
    venues: {
      bengaluru: "Good Shepherd Auditorium",
      delhi: "Kamani Auditorium",
      mumbai: "St. Andrews, Bandra",
      hyderabad: "Shilpakala Vedika",
      chennai: "Music Academy",
      kochi: "JT Pac, Choice School",
    },
  },
  {
    slug: "danish-sait-live",
    title: "DANISH SAIT — LOOSE CANNON",
    category: "Comedy",
    tag: "Stand-up Comedy",
    date: "Thu, 13 Aug",
    time: "8:30 PM",
    price: "From ₹599",
    image: imgComedy,
    languages: ["English", "Kannada"],
    cities: ["bengaluru", "mumbai", "hyderabad"],
    venues: {
      bengaluru: "Ranga Shankara, JP Nagar",
      mumbai: "The Habitat, Khar",
      hyderabad: "Aaromale, Jubilee Hills",
    },
  },
  {
    slug: "tughlaq-the-play",
    title: "TUGHLAQ — THE PLAY",
    category: "Plays",
    tag: "Historical Drama",
    date: "Sat, 22 Aug",
    time: "7:30 PM",
    price: "From ₹499",
    image: imgPlay,
    languages: ["Hindi", "English"],
    cities: ["delhi", "mumbai", "bengaluru", "chennai"],
    venues: {
      delhi: "National School of Drama",
      mumbai: "Prithvi Theatre, Juhu",
      bengaluru: "Ranga Shankara, JP Nagar",
      chennai: "Sir Mutha Venkatasubba Rao Hall",
    },
  },
  {
    slug: "midsummer-nights-dream",
    title: "A MIDSUMMER NIGHT'S DREAM",
    category: "Plays",
    tag: "Shakespeare / Comedy",
    date: "Sun, 23 Aug",
    time: "5:00 PM",
    price: "From ₹399",
    image: imgPlay,
    languages: ["English"],
    cities: ALL,
    venues: {
      bengaluru: "Chowdiah Memorial Hall",
      delhi: "Sri Ram Centre, Mandi House",
      mumbai: "NCPA Experimental Theatre",
      hyderabad: "Lamakaan, Banjara Hills",
      chennai: "Alliance Française Chennai",
      kochi: "Kerala Fine Arts Hall",
    },
  },
  {
    slug: "ipl-qualifier",
    title: "IPL QUALIFIER 1 — RCB vs CSK",
    category: "Sports",
    tag: "T20 Cricket",
    date: "Tue, 18 Aug",
    time: "7:30 PM",
    price: "From ₹1,200",
    image: imgSports,
    languages: ["English", "Hindi"],
    cities: ["bengaluru", "chennai", "hyderabad", "mumbai", "delhi"],
    venues: {
      bengaluru: "M. Chinnaswamy Stadium",
      chennai: "M. A. Chidambaram Stadium",
      hyderabad: "Rajiv Gandhi Intl. Stadium",
      mumbai: "Wankhede Stadium",
      delhi: "Arun Jaitley Stadium",
    },
  },
  {
    slug: "isl-football-derby",
    title: "ISL DERBY — BFC vs KBFC",
    category: "Sports",
    tag: "Football",
    date: "Sat, 29 Aug",
    time: "7:30 PM",
    price: "From ₹350",
    image: imgSports,
    languages: ["English"],
    cities: ["bengaluru", "kochi"],
    venues: {
      bengaluru: "Sree Kanteerava Stadium",
      kochi: "Jawaharlal Nehru Stadium, Kaloor",
    },
  },
  {
    slug: "sunburn-arena",
    title: "SUNBURN ARENA FEST",
    category: "Events",
    tag: "EDM Festival",
    date: "Sat, 30 Aug",
    time: "4:00 PM",
    price: "From ₹1,499",
    image: imgConcert,
    languages: ["English"],
    cities: ["mumbai", "delhi", "bengaluru", "hyderabad"],
    venues: {
      mumbai: "Mahalaxmi Race Course",
      delhi: "Gurugram Leisure Valley",
      bengaluru: "Embassy Intl. Riding School",
      hyderabad: "Parade Grounds, Secunderabad",
    },
  },
  {
    slug: "food-and-music-carnival",
    title: "STREET FOOD & MUSIC CARNIVAL",
    category: "Events",
    tag: "Festival / Family",
    date: "Sun, 31 Aug",
    time: "12:00 PM",
    price: "From ₹299",
    image: imgConcert,
    languages: ["Multi-language"],
    cities: ALL,
    venues: {
      bengaluru: "Jayamahal Palace Grounds",
      delhi: "Jawaharlal Nehru Stadium Lawns",
      mumbai: "Jio World Garden, BKC",
      hyderabad: "Necklace Road Grounds",
      chennai: "Island Grounds",
      kochi: "Marine Drive Grounds",
    },
  },
];

export function eventsFor(city: CityKey, category?: EventCategory): LiveEvent[] {
  return EVENTS.filter(
    (e) => e.cities.includes(city) && (!category || e.category === category),
  );
}

export function venueFor(event: LiveEvent, city: CityKey): string {
  return event.venues[city] ?? cityByKey(city).name;
}
