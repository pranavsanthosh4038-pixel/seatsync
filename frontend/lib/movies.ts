
export type CityKey =
  | "bengaluru"
  | "delhi"
  | "mumbai"
  | "hyderabad"
  | "chennai"
  | "kochi";

export type City = {
  key: CityKey;
  name: string;
  /** Language that local prints are additionally dubbed / released in */
  localLanguage: string;
  theatres: string[];
};

export const CITIES: City[] = [
  {
    key: "bengaluru",
    name: "Bengaluru",
    localLanguage: "Kannada",
    theatres: [
      "PVR Orion Mall",
      "INOX Garuda Mall",
      "Cinepolis Nexus Koramangala",
      "PVR Forum Mall",
      "INOX Mantri Square",
      "PVR Phoenix Marketcity",
    ],
  },
  {
    key: "delhi",
    name: "Delhi NCR",
    localLanguage: "Hindi",
    theatres: [
      "PVR Select Citywalk Saket",
      "INOX Nehru Place",
      "PVR Priya Vasant Vihar",
      "Cinepolis DLF Mall of India",
      "PVR Pacific Tagore Garden",
      "Delite Cinema Asaf Ali Road",
    ],
  },
  {
    key: "mumbai",
    name: "Mumbai",
    localLanguage: "Marathi",
    theatres: [
      "PVR Icon Versova",
      "INOX R-City Ghatkopar",
      "Cinepolis Andheri Fun Republic",
      "Regal Cinema Colaba",
      "PVR Phoenix Palladium Lower Parel",
      "Maratha Mandir Mumbai Central",
    ],
  },
  {
    key: "hyderabad",
    name: "Hyderabad",
    localLanguage: "Telugu",
    theatres: [
      "AMB Cinemas Gachibowli",
      "Prasads Multiplex Necklace Road",
      "PVR Inorbit Madhapur",
      "Sudarshan 35MM RTC X Roads",
      "AAA Cinemas Ameerpet",
      "INOX GVK One Banjara Hills",
    ],
  },
  {
    key: "chennai",
    name: "Chennai",
    localLanguage: "Tamil",
    theatres: [
      "Sathyam Cinemas Royapettah",
      "AGS Cinemas OMR",
      "PVR Ampa Skywalk",
      "Rohini Silver Screens Koyambedu",
      "INOX Chennai Citi Centre",
      "Kasi Theatre Ashok Nagar",
    ],
  },
  {
    key: "kochi",
    name: "Kochi",
    localLanguage: "Malayalam",
    theatres: [
      "PVR Lulu Mall Edappally",
      "Cinepolis Centre Square",
      "Saritha Savitha Sangeetha Kacheripady",
      "Vanitha Cineplex Kaloor",
      "Padma Theatre Marine Drive",
      "Q Cinemas Kakkanad",
    ],
  },

];

export function cityByKey(key: string): City {
  return CITIES.find((c) => c.key === key) ?? CITIES[0];
}

export type Showtime = {
  id: string;
  time: string;
  theatre: string;
  screen: string;
  city: CityKey;
  languages: string;
};

export type Movie = {
  slug: string;
  title: string;
  genre: string;
  /** Languages the film is natively released in */
  languages: string[];
  rating: string;
  duration: string;
  poster: string;
  /** Cities where this title is currently running */
  cities: CityKey[];
  /** Cities that also get a dubbed local-language print */
  dubbed?: CityKey[];
  /** Optional marketing badge, e.g. BLOCKBUSTER */
  badge?: string;
  times: string[];
};

const ALL: CityKey[] = ["bengaluru", "delhi", "mumbai", "hyderabad", "chennai", "kochi"];

const ph = (t: string) =>
  `https://placehold.co/500x750/1a1a1a/ffffff?text=${encodeURIComponent(t)}`;
const tmdb = (f: string) => `https://image.tmdb.org/t/p/w500${f}`;

const T1 = ["9:45 AM", "1:00 PM", "4:30 PM", "8:15 PM", "11:30 PM"];
const T2 = ["10:30 AM", "2:15 PM", "6:45 PM", "10:15 PM"];
const T3 = ["11:00 AM", "2:45 PM", "6:15 PM", "9:50 PM"];
const T4 = ["10:00 AM", "1:20 PM", "5:00 PM", "9:40 PM"];

export const MOVIES: Movie[] = [
  {
    slug: "spider-man-beyond",
    title: "Spider-Man: Brand New Day",
    genre: "Superhero / Action",
    languages: ["English", "Hindi"],
    rating: "UA",
    duration: "2h 21m",
    poster: tmdb("/iPOn6DinuVyLY17YM9mKuPofV08.jpg"),
    cities: ALL,
    dubbed: ["hyderabad", "chennai", "kochi", "bengaluru"],
    times: T1,
  },
  {
    slug: "a-minecraft-movie",
    title: "A Minecraft Movie",
    genre: "Adventure / Family",
    languages: ["English", "Hindi"],
    rating: "U",
    duration: "1h 41m",
    poster: tmdb("/yFHHfHcUgGAxziP1C3lLt0q2T4s.jpg"),
    cities: ALL,
    dubbed: ["bengaluru", "chennai", "kochi", "hyderabad"],
    times: T2,
  },
  {
    slug: "mission-impossible-final-reckoning",
    title: "Mission: Impossible — The Final Reckoning",
    genre: "Action / Spy Thriller",
    languages: ["English", "Hindi"],
    rating: "UA",
    duration: "2h 49m",
    poster: tmdb("/z53D72EAOxGRqdr7KXXWp9dJiDe.jpg"),
    cities: ALL,
    dubbed: ["hyderabad", "chennai", "kochi", "bengaluru"],
    times: T3,
  },
  {
    slug: "thunderbolts",
    title: "Thunderbolts*",
    genre: "Superhero / Action",
    languages: ["English", "Hindi"],
    rating: "UA",
    duration: "2h 07m",
    poster: tmdb("/hqcexYHbiTBfDIdDWxrxPtVndBX.jpg"),
    cities: ALL,
    dubbed: ["hyderabad", "chennai"],
    times: T2,
  },
  {
    slug: "avatar-fire-and-ash",
    title: "Avatar: Fire and Ash",
    genre: "Sci-Fi / Adventure",
    languages: ["English", "Hindi"],
    rating: "UA",
    duration: "3h 15m",
    poster: tmdb("/bRBeSHfGHwkEpImlhxPmOcUsaeg.jpg"),
    cities: ALL,
    dubbed: ["bengaluru", "hyderabad", "chennai", "kochi"],
    times: T1,
  },
  {
    slug: "superman",
    title: "Superman",
    genre: "Superhero / Action",
    languages: ["English", "Hindi"],
    rating: "UA",
    duration: "2h 09m",
    poster: tmdb("/ombsmhYUqR4qqOLOxAyr5V8hbyv.jpg"),
    cities: ALL,
    dubbed: ["hyderabad", "chennai", "kochi"],
    times: T3,
  },
  {
    slug: "jurassic-world-rebirth",
    title: "Jurassic World Rebirth",
    genre: "Action / Adventure",
    languages: ["English", "Hindi"],
    rating: "UA",
    duration: "2h 14m",
    poster: tmdb("/1RICxzeoNCAO5NpcRMIgg1XT6fm.jpg"),
    cities: ALL,
    dubbed: ["bengaluru", "chennai", "hyderabad"],
    times: T2,
  },
  {
    slug: "alpha",
    title: "Alpha",
    genre: "Sci-Fi Thriller",
    languages: ["English"],
    rating: "UA",
    duration: "2h 14m",
    poster: ph("Alpha"),
    cities: ["bengaluru", "delhi", "mumbai", "hyderabad"],
    dubbed: ["delhi", "hyderabad"],
    times: T2,
  },
  {
    slug: "toy-story-5",
    title: "Toy Story 5",
    genre: "Animation / Family",
    languages: ["English", "Hindi"],
    rating: "U",
    duration: "1h 58m",
    poster: tmdb("/sfQtVlIHljToOwYjhe21KPGzZWK.jpg"),
    cities: ALL,
    dubbed: ["hyderabad", "chennai", "kochi", "bengaluru"],
    times: ["9:00 AM", "12:15 PM", "3:30 PM", "7:45 PM"],
  },
  {
    slug: "final-destination-bloodlines",
    title: "Final Destination: Bloodlines",
    genre: "Horror / Thriller",
    languages: ["English", "Hindi"],
    rating: "A",
    duration: "1h 50m",
    poster: tmdb("/6WxhEvFsauuACfv8HyoVX6mZKFj.jpg"),
    cities: ALL,
    dubbed: ["hyderabad", "chennai"],
    times: T4,
  },
  {
    slug: "the-odyssey",
    title: "The Odyssey",
    genre: "Epic / Mythological Adventure",
    languages: ["English"],
    rating: "UA",
    duration: "2h 52m",
    poster: "https://image.tmdb.org/t/p/w500/mVFAFNpFRNkGqfNFdIvzTHBiypS.jpg",
    cities: ALL,
    dubbed: ["delhi", "mumbai", "hyderabad", "chennai"],
    times: T2,
  },

  /* Bollywood / pan-India */
  {
    slug: "housefull-5",
    title: "Housefull 5",
    genre: "Comedy",
    languages: ["Hindi"],
    rating: "UA",
    duration: "2h 25m",
    poster: "https://placehold.co/300x450/001a00/00ff44?text=HOUSEFULL+5&font=oswald",
    cities: ALL,
    times: T3,
  },
  {
    slug: "sikandar",
    title: "Sikandar",
    genre: "Action / Drama",
    languages: ["Hindi"],
    rating: "UA",
    duration: "2h 35m",
    poster: "https://image.tmdb.org/t/p/w500/iQtIjJPHXBrYcBRKMVcDyFbJlkn.jpg",
    cities: ALL,
    times: T1,
  },
  {
    slug: "war-2",
    title: "War 2",
    genre: "Action / Spy Thriller",
    languages: ["Hindi"],
    rating: "UA",
    duration: "2h 41m",
    poster: "https://placehold.co/300x450/0a0a0a/ff0000?text=WAR+2&font=oswald",
    cities: ALL,
    dubbed: ["hyderabad", "chennai"],
    times: T2,
  },
  {
    slug: "pushpa-3",
    title: "Pushpa 3",
    genre: "Action / Drama",
    languages: ["Telugu", "Hindi"],
    rating: "UA",
    duration: "2h 58m",
    poster: "https://placehold.co/300x450/1a0800/ff3300?text=PUSHPA+3&font=oswald",
    cities: ALL,
    dubbed: ["bengaluru", "chennai", "kochi"],
    times: T1,
  },
  {
    slug: "coolie",
    title: "Coolie",
    genre: "Action / Thriller",
    languages: ["Tamil", "Hindi"],
    rating: "UA",
    duration: "2h 28m",
    poster: "https://placehold.co/300x450/0d0d0d/ff4400?text=COOLIE&font=oswald",
    cities: ALL,
    dubbed: ["bengaluru", "hyderabad", "kochi"],
    times: T3,
  },
  {
    slug: "l2-empuraan",
    title: "L2: Empuraan",
    genre: "Thriller / Action",
    languages: ["Malayalam", "Hindi"],
    rating: "UA",
    duration: "2h 59m",
    poster: tmdb("/rlK1u6zJp8AJ93XX8dgiZVsE5w8.jpg"),
    cities: ALL,
    dubbed: ["bengaluru", "chennai", "hyderabad"],
    times: T4,
  },
  {
    slug: "kgf-chapter-3",
    title: "KGF Chapter 3",
    genre: "Action / Drama",
    languages: ["Kannada", "Hindi"],
    rating: "UA",
    duration: "2h 50m",
    poster: "https://placehold.co/300x450/1a1400/ffcc00?text=KGF+CHAPTER+3&font=oswald",
    cities: ALL,
    dubbed: ["chennai", "hyderabad", "kochi"],
    times: T1,
  },
  {
    slug: "stree-3",
    title: "Stree 3",
    genre: "Horror / Comedy",
    languages: ["Hindi"],
    rating: "UA",
    duration: "2h 22m",
    poster: "https://placehold.co/300x450/0a001a/cc00ff?text=STREE+3&font=oswald",
    cities: ALL,
    times: T2,
  },

  /* Bengaluru */
  {
    slug: "kantara-chapter-2",
    title: "Kantara 2",
    genre: "Action / Mythology",
    languages: ["Kannada"],
    rating: "UA",
    duration: "2h 48m",
    poster: "https://placehold.co/300x450/1a0800/ff6600?text=KANTARA+2&font=oswald",
    cities: ALL,
    dubbed: ["delhi", "mumbai", "hyderabad", "chennai", "kochi"],
    times: T1,
  },
  {
    slug: "bagheera",
    title: "Bagheera 2",
    genre: "Action / Vigilante",
    languages: ["Kannada"],
    rating: "UA",
    duration: "2h 22m",
    poster: "https://placehold.co/300x450/0a0a0a/00ff88?text=BAGHEERA&font=oswald",
    cities: ["bengaluru", "hyderabad", "chennai"],
    dubbed: ["hyderabad", "chennai"],
    times: T4,
  },
  {
    slug: "ui-2",
    title: "UI 2",
    genre: "Thriller",
    languages: ["Kannada"],
    rating: "UA",
    duration: "2h 36m",
    poster: "https://placehold.co/300x450/0d0d1a/ffffff?text=UI+2&font=oswald",
    cities: ["bengaluru"],
    times: T3,
  },

  /* Mumbai */
  {
    slug: "deva",
    title: "Deva",
    genre: "Action / Crime",
    languages: ["Hindi"],
    rating: "UA",
    duration: "2h 36m",
    poster: tmdb("/mD2MaXcWTEIy9B0X9tk8qrn3Krr.jpg"),
    cities: ["mumbai"],
    times: T2,
  },
  {
    slug: "sky-force",
    title: "Sky Force",
    genre: "Action / War",
    languages: ["Hindi"],
    rating: "UA",
    duration: "2h 05m",
    poster: tmdb("/szccoIaJZywnRtcTWdAJLlE5bUq.jpg"),
    cities: ["mumbai"],
    times: T4,
  },

  /* Delhi NCR */
  {
    slug: "chhaava-2",
    title: "Chhaava 2",
    genre: "Historical / Drama",
    languages: ["Hindi"],
    rating: "UA",
    duration: "2h 41m",
    poster: tmdb("/ubRsrzb6NRW8YhVTJ6jG1kpNvCi.jpg"),
    cities: ["delhi"],
    times: T1,
  },
  {
    slug: "raid-2",
    title: "Raid 2",
    genre: "Thriller / Drama",
    languages: ["Hindi"],
    rating: "UA",
    duration: "2h 17m",
    poster: tmdb("/mlGuKlIDLdPhYjz1QBXi0FmyYik.jpg"),
    cities: ["delhi"],
    times: T3,
  },

  /* Chennai */
  {
    slug: "thalapathy-69",
    title: "Thalapathy 69",
    genre: "Action / Political Drama",
    languages: ["Tamil"],
    rating: "UA",
    duration: "2h 44m",
    poster: ph("Thalapathy 69"),
    cities: ["chennai"],
    times: T1,
  },
  {
    slug: "thug-life",
    title: "Thug Life",
    genre: "Action / Crime",
    languages: ["Tamil"],
    rating: "UA",
    duration: "2h 38m",
    poster: ph("Thug Life"),
    cities: ["chennai"],
    times: T2,
  },
  {
    slug: "retro",
    title: "Retro",
    genre: "Drama / Romance",
    languages: ["Tamil"],
    rating: "UA",
    duration: "2h 28m",
    poster: tmdb("/ptSkJUONxCIYIz6GdbQrXOwYIqQ.jpg"),
    cities: ["chennai"],
    times: T4,
  },

  /* Hyderabad */
  {
    slug: "sankranthiki-vasthunam-2",
    title: "Sankranthiki Vasthunam 2",
    genre: "Comedy / Family",
    languages: ["Telugu"],
    rating: "U",
    duration: "2h 39m",
    poster: tmdb("/gFa07KuR3tWFI6YFTeGz930zeMo.jpg"),
    cities: ["hyderabad"],
    times: T3,
  },
  {
    slug: "game-changer-2",
    title: "Game Changer 2",
    genre: "Action / Political Drama",
    languages: ["Telugu"],
    rating: "UA",
    duration: "2h 45m",
    poster: ph("Game Changer 2"),
    cities: ["hyderabad"],
    times: T1,
  },
  {
    slug: "devara-part-2",
    title: "Devara Part 2",
    genre: "Action / Drama",
    languages: ["Telugu"],
    rating: "UA",
    duration: "2h 41m",
    poster: ph("Devara Part 2"),
    cities: ["hyderabad", "bengaluru", "chennai", "mumbai", "delhi"],
    dubbed: ["mumbai", "delhi", "chennai", "bengaluru"],
    times: T2,
  },
  {
    slug: "nagabandham",
    title: "Nagabandham",
    genre: "Mythological / Action",
    languages: ["Telugu"],
    rating: "UA",
    duration: "2h 32m",
    poster: ph("Nagabandham"),
    cities: ["hyderabad", "bengaluru", "chennai", "kochi"],
    dubbed: ["bengaluru", "chennai", "kochi"],
    times: T3,
  },
  {
    slug: "raat-rani",
    title: "Raat Rani",
    genre: "Romance / Musical",
    languages: ["Hindi"],
    rating: "UA",
    duration: "2h 09m",
    poster: ph("Raat Rani"),
    cities: ["mumbai", "delhi", "bengaluru", "hyderabad"],
    times: T4,
  },
  {
    slug: "kayal",
    title: "Kayal",
    genre: "Investigative Thriller",
    languages: ["Malayalam"],
    rating: "A",
    duration: "2h 17m",
    poster: ph("Kayal"),
    cities: ["kochi", "chennai", "bengaluru", "mumbai"],
    dubbed: ["chennai", "bengaluru"],
    times: T4,
  },
  {
    slug: "minions-and-monsters",
    title: "Minions & Monsters",
    genre: "Animation / Comedy",
    languages: ["English", "Hindi"],
    rating: "U",
    duration: "1h 42m",
    poster: ph("Minions and Monsters"),
    cities: ALL,
    dubbed: ["bengaluru", "chennai", "kochi", "hyderabad"],
    times: T2,
  },
  /* ── August 2026 line-up ── */
  {
    slug: "dhurandhar-the-revenge",
    title: "Dhurandhar: The Revenge",
    genre: "Action / Thriller · ₹1,851 Cr worldwide",
    languages: ["Hindi"],
    rating: "UA",
    duration: "2h 47m",
    poster: "https://image.tmdb.org/t/p/w500/aA8JdaESgCHDuCUmBLBPFTgGPeV.jpg",
    cities: ALL,
    dubbed: ["hyderabad", "chennai", "kochi", "bengaluru"],
    badge: "All Time Blockbuster",
    times: T1,
  },
  {
    slug: "border-2",
    title: "Border 2",
    genre: "War / Action · ₹464 Cr worldwide",
    languages: ["Hindi"],
    rating: "UA",
    duration: "2h 52m",
    poster: "https://image.tmdb.org/t/p/w500/vXg9ybBNMUbOlLMJpKqy4vA6HPC.jpg",
    cities: ALL,
    dubbed: ["hyderabad", "chennai"],
    times: T2,
  },
  {
    slug: "awarapan-2",
    title: "Awarapan 2",
    genre: "Action / Thriller",
    languages: ["Hindi"],
    rating: "A",
    duration: "2h 18m",
    poster: "https://placehold.co/300x450/0a0a1a/4488ff?text=AWARAPAN+2&font=oswald",
    cities: ALL,
    times: T3,
  },
  {
    slug: "batwara-1947",
    title: "Batwara 1947",
    genre: "Historical Drama",
    languages: ["Hindi"],
    rating: "UA",
    duration: "2h 34m",
    poster: "https://placehold.co/300x450/1a0e00/cc8800?text=BATWARA+1947&font=oswald",
    cities: ALL,
    times: T4,
  },
  {
    slug: "khosla-ka-ghosla-2",
    title: "Khosla Ka Ghosla 2",
    genre: "Comedy · Aug 28, 2026",
    languages: ["Hindi"],
    rating: "U",
    duration: "2h 06m",
    poster: "https://placehold.co/300x450/001a1a/00ccaa?text=KHOSLA+KA+GHOSLA+2&font=oswald",
    cities: ALL,
    times: T2,
  },

  /* Tamil */
  {
    slug: "karuppu",
    title: "Karuppu",
    genre: "Action / Thriller · ₹342 Cr worldwide",
    languages: ["Tamil"],
    rating: "UA",
    duration: "2h 39m",
    poster: "https://image.tmdb.org/t/p/w500/bHHCIJGKS0SJlSHfTgGVuCe8JR5.jpg",
    cities: ["chennai", "bengaluru", "hyderabad", "mumbai", "delhi"],
    dubbed: ["bengaluru", "hyderabad", "mumbai", "delhi"],
    badge: "Blockbuster",
    times: T1,
  },
  {
    slug: "dc-tamil",
    title: "DC",
    genre: "Action / Drama · Aug 7, 2026",
    languages: ["Tamil"],
    rating: "UA",
    duration: "2h 21m",
    poster: "https://placehold.co/300x450/0a0000/ff2200?text=DC&font=oswald",
    cities: ["chennai", "bengaluru", "hyderabad", "mumbai", "delhi"],
    times: T3,
  },
  {
    slug: "gatta-kusthi-2",
    title: "Gatta Kusthi 2",
    genre: "Comedy / Romance · IMDb 8.3",
    languages: ["Tamil", "Telugu"],
    rating: "UA",
    duration: "2h 12m",
    poster: "https://image.tmdb.org/t/p/w500/xGjAiLQXJXrRHKXSHYHo4tPJUMV.jpg",
    cities: ["chennai", "bengaluru", "hyderabad", "mumbai", "delhi"],
    times: T4,
  },
  {
    slug: "jana-nayagan",
    title: "Jana Nayagan",
    genre: "Action · Diwali 2026 · Advance booking open",
    languages: ["Tamil"],
    rating: "UA",
    duration: "2h 45m",
    poster: "https://placehold.co/300x450/0a0a0a/e23744?text=JANA+NAYAGAN&font=oswald",
    cities: ["chennai", "bengaluru", "hyderabad", "mumbai", "delhi"],
    dubbed: ["bengaluru", "hyderabad"],
    badge: "Most Anticipated",
    times: T2,
  },

  /* Telugu */
  {
    slug: "mana-shankara-vara-prasad-garu",
    title: "Mana Shankara Vara Prasad Garu",
    genre: "Drama / Comedy · ₹300 Cr worldwide",
    languages: ["Telugu"],
    rating: "U",
    duration: "2h 28m",
    poster: "https://placehold.co/300x450/1a0a00/ff8800?text=MANA+SHANKARA&font=oswald",
    cities: ["hyderabad", "bengaluru", "chennai", "mumbai"],
    dubbed: ["bengaluru", "chennai"],
    times: T1,
  },
  {
    slug: "korean-kanakaraju",
    title: "Korean Kanakaraju",
    genre: "Comedy · Aug 7, 2026",
    languages: ["Telugu"],
    rating: "UA",
    duration: "2h 09m",
    poster: "https://placehold.co/300x450/001010/00cccc?text=KOREAN+KANAKARAJU&font=oswald",
    cities: ["hyderabad", "bengaluru", "chennai", "mumbai"],
    times: T3,
  },
  {
    slug: "peddi",
    title: "Peddi",
    genre: "Action",
    languages: ["Telugu"],
    rating: "UA",
    duration: "2h 42m",
    poster: "https://placehold.co/300x450/0a0000/ff6600?text=PEDDI&font=oswald",
    cities: ["hyderabad", "bengaluru", "chennai", "mumbai"],
    dubbed: ["bengaluru", "chennai"],
    times: T4,
  },
  {
    slug: "the-raja-saab",
    title: "The Raja Saab",
    genre: "Horror / Comedy",
    languages: ["Telugu"],
    rating: "UA",
    duration: "2h 36m",
    poster: "https://placehold.co/300x450/0a001a/cc44ff?text=THE+RAJA+SAAB&font=oswald",
    cities: ["hyderabad", "bengaluru", "chennai", "mumbai"],
    dubbed: ["bengaluru", "chennai"],
    times: T2,
  },

  /* Malayalam */
  {
    slug: "thudakkam",
    title: "Thudakkam",
    genre: "Thriller · Aug 7, 2026",
    languages: ["Malayalam"],
    rating: "UA",
    duration: "2h 11m",
    poster: "https://placehold.co/300x450/000a1a/0088ff?text=THUDAKKAM&font=oswald",
    cities: ["kochi", "bengaluru", "mumbai"],
    times: T3,
  },
  {
    slug: "vaazha-2",
    title: "Vaazha 2",
    genre: "Drama · ₹92 Cr global",
    languages: ["Malayalam"],
    rating: "UA",
    duration: "2h 08m",
    poster: "https://placehold.co/300x450/0a0010/8800ff?text=VAAZHA+2&font=oswald",
    cities: ["kochi", "bengaluru", "mumbai"],
    times: T4,
  },
  {
    slug: "aadu-3",
    title: "Aadu 3",
    genre: "Comedy · ₹119 Cr",
    languages: ["Malayalam"],
    rating: "UA",
    duration: "2h 24m",
    poster: "https://placehold.co/300x450/001a00/44ff44?text=AADU+3&font=oswald",
    cities: ["kochi", "bengaluru", "mumbai"],
    times: T1,
  },
  {
    slug: "drishyam-3",
    title: "Drishyam 3",
    genre: "Thriller",
    languages: ["Malayalam"],
    rating: "UA",
    duration: "2h 38m",
    poster: "https://placehold.co/300x450/0a0f1a/33aaff?text=DRISHYAM+3&font=oswald",
    cities: ["kochi", "bengaluru", "mumbai", "chennai", "hyderabad"],
    dubbed: ["bengaluru", "chennai", "hyderabad"],
    badge: "Most Anticipated",
    times: T2,
  },

  /* Kannada */
  {
    slug: "toxic-fairy-tale",
    title: "Toxic: A Fairy Tale for Grown-Ups",
    genre: "Action / Fantasy · Aug 26, 2026",
    languages: ["Kannada"],
    rating: "A",
    duration: "2h 47m",
    poster: "https://placehold.co/300x450/1a0a2e/bf00ff?text=TOXIC&font=oswald",
    cities: ALL,
    dubbed: ["delhi", "mumbai", "hyderabad", "chennai", "kochi"],
    badge: "Most Anticipated",
    times: T1,
  },
  {
    slug: "love-mocktail-3",
    title: "Love Mocktail 3",
    genre: "Romance · Aug 19, 2026",
    languages: ["Kannada"],
    rating: "U",
    duration: "2h 14m",
    poster: "https://placehold.co/300x450/1a0010/ff44aa?text=LOVE+MOCKTAIL+3&font=oswald",
    cities: ["bengaluru"],
    times: T3,
  },
  {
    slug: "landlord",
    title: "Landlord",
    genre: "Action · Aug 23, 2026",
    languages: ["Kannada"],
    rating: "UA",
    duration: "2h 26m",
    poster: "https://placehold.co/300x450/0a0800/ffaa00?text=LANDLORD&font=oswald",
    cities: ["bengaluru"],
    times: T4,
  },

  /* Hollywood */
  {
    slug: "the-end-of-oak-street",
    title: "The End of Oak Street",
    genre: "Sci-Fi / Thriller · IMAX · Aug 14, 2026",
    languages: ["English"],
    rating: "UA",
    duration: "2h 16m",
    poster: "https://placehold.co/300x450/001a00/88ff44?text=END+OF+OAK+STREET&font=oswald",
    cities: ALL,
    times: T2,
  },
  {
    slug: "the-dog-stars",
    title: "The Dog Stars",
    genre: "Drama",
    languages: ["English"],
    rating: "UA",
    duration: "2h 04m",
    poster: ph("The Dog Stars"),
    cities: ALL,
    times: T3,
  },
  {
    slug: "coyote-vs-acme",
    title: "Coyote vs Acme",
    genre: "Comedy / Animation",
    languages: ["English", "Hindi"],
    rating: "U",
    duration: "1h 46m",
    poster: "https://placehold.co/300x450/1a1000/ffdd00?text=COYOTE+VS+ACME&font=oswald",
    cities: ALL,
    dubbed: ["hyderabad", "chennai", "kochi", "bengaluru"],
    times: T4,
  },
];

/** Languages a title screens in for a given city */
export function languagesFor(movie: Movie, cityKey: CityKey): string {
  const city = cityByKey(cityKey);
  const langs = [...movie.languages];
  if (movie.dubbed?.includes(cityKey) && !langs.includes(city.localLanguage)) {
    langs.push(city.localLanguage);
  }
  return langs.join(" · ");
}

export function moviesForCity(cityKey: CityKey): Movie[] {
  return MOVIES.filter((m) => m.cities.includes(cityKey));
}

export function showtimesFor(movie: Movie, cityKey: CityKey): Showtime[] {
  const city = cityByKey(cityKey);
  const langs = languagesFor(movie, cityKey);
  const offset = movie.slug.length;
  return movie.times.map((t, i) => ({
    id: `${movie.slug}--${cityKey}--${i}`,
    time: t,
    theatre: city.theatres[(i + offset) % city.theatres.length],
    screen: `Screen ${(i % 4) + 1}`,
    city: cityKey,
    languages: langs,
  }));
}

export function findMovieByShowtime(
  showId: string,
): { movie: Movie; showtime: Showtime; city: City } | null {
  const [slug, cityKey] = showId.split("--");
  const movie = MOVIES.find((m) => m.slug === slug);
  if (!movie || !cityKey) return null;
  const showtime = showtimesFor(movie, cityKey as CityKey).find((s) => s.id === showId);
  if (!showtime) return null;
  return { movie, showtime, city: cityByKey(cityKey) };
}
