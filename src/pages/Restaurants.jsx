// src/pages/Restaurants.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import axiosInstance from "../api/axiosInstance";
import { getImageUrl } from "../utils/getImageUrl";
import FavoriteButton from "../components/FavoriteButton";
import { isRestaurantOpenNow } from "../utils/isRestaurantOpen";

/* ------------------------------------------------------------------------ */
/*  Exact Palette Preservation:                                             */
/*  ink        #1B1712      paper      #FFFFFF     line       #ECE7DD       */
/*  marigold   #D98A2B      marigold-d #B96F1A      olive     #4B5D45       */
/* ------------------------------------------------------------------------ */

const EASE = [0.16, 1, 0.3, 1];

/* ---------------------------------- SVG Icons ---------------------------------- */

function IconStar(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.5 15 9l7 .9-5.1 4.8L18.2 21 12 17.4 5.8 21l1.3-6.3L2 9.9 9 9l3-6.5Z" />
    </svg>
  );
}
function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function IconX(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function IconImageOff(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 16 4.5-4.5a2 2 0 0 1 2.8 0L14 15" />
      <circle cx="9" cy="9" r="1.3" />
    </svg>
  );
}
function IconMapPin(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}
function IconSearchOff(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3M8 11h6" />
    </svg>
  );
}
function IconChevronDown(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function IconUtensils(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 2v8a2 2 0 0 0 4 0V2M8 10v12M18 2c-2 1-3 3-3 6s1 3 3 3v11" />
    </svg>
  );
}
function IconEye(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconChevronRight(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Rating, high to low" },
  { value: "name", label: "Name, A–Z" },
];

const FOOD_CATEGORIES = [
  { name: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop" },
  { name: "Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop" },
  { name: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop" },
  { name: "Chinese", image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?q=80&w=600&auto=format&fit=crop" },
  { name: "North Indian", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=600&auto=format&fit=crop" },
  { name: "Desserts", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=600&auto=format&fit=crop" },
];

const prefersReducedMotion =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------- Animated Counter ---------------------------------- */

function AnimatedNumber({ value, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion || value <= 0) {
      setDisplay(value);
      return;
    }
    const duration = 900;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

/* ---------------------------------- ReactBits SplitBlurText Animation ---------------------------------- */

function SplitBlurText({ text, delay = 0.04, className = "" }) {
  const words = text.split(" ");
  return (
    <span className={`inline-flex flex-wrap gap-x-[0.28em] ${className}`}>
      {words.map((word, wIdx) => (
        <span key={wIdx} className="inline-block whitespace-nowrap overflow-hidden">
          <motion.span
            initial={{ opacity: 0, filter: "blur(12px)", y: 24, rotateX: -45 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0, rotateX: 0 }}
            transition={{
              duration: 0.75,
              delay: wIdx * delay,
              ease: EASE,
            }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ---------------------------------- Drawn Underline ---------------------------------- */

function DrawnUnderline() {
  return (
    <svg
      viewBox="0 0 210 14"
      className="pointer-events-none absolute -bottom-1 left-0 h-[0.3em] w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.path
        d="M2 9.5C40 4 100 3 148 6.5C168 8 188 9 208 6"
        fill="none"
        stroke="#D98A2B"
        strokeWidth="5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.65, ease: EASE }}
      />
    </svg>
  );
}

/* ---------------------------------- ReactBits 3D Stack Card Showcase ---------------------------------- */

function InteractiveHeroShowcase({ onCategorySelect }) {
  const cards = [
    {
      id: 1,
      title: "Royal North Indian Feast",
      tagline: "Rich Biryanis & Slow-cooked Gravies",
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=1000&auto=format&fit=crop",
      tag: "Top Choice",
    },
    {
      id: 2,
      title: "Woodfired Artisan Pizza",
      tagline: "Crispy Crusts & Melted Mozzarella",
      category: "Pizza",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop",
      tag: "Trending",
    },
    {
      id: 3,
      title: "Gourmet Loaded Burgers",
      tagline: "Smash Patties & Caramelized Onions",
      category: "Burgers",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop",
      tag: "Fast Express",
    },
    {
      id: 4,
      title: "Artisanal Sweet Desserts",
      tagline: "Decadent Cakes & Smooth Gelato",
      category: "Desserts",
      image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=1000&auto=format&fit=crop",
      tag: "Must Try",
    },
  ];

  const [deck, setDeck] = useState(cards);
  const [isPaused, setIsPaused] = useState(false);

  const rotateStack = () => {
    setDeck((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      rotateStack();
    }, 3800);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative mx-auto h-[380px] w-[340px]"
    >
      <AnimatePresence initial={false}>
        {deck.map((card, index) => {
          const isTop = index === 0;
          return (
            <motion.div
              key={card.id}
              layout
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{
                scale: 1 - index * 0.05,
                y: index * 14,
                zIndex: deck.length - index,
                opacity: index > 2 ? 0 : 1,
              }}
              exit={{
                x: 300,
                opacity: 0,
                rotate: 20,
                scale: 0.85,
                transition: { duration: 0.4, ease: EASE },
              }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={() => {
                if (isTop) onCategorySelect(card.category);
                else rotateStack();
              }}
              className="absolute inset-0 cursor-pointer overflow-hidden rounded-[26px] border border-[#ECE7DD] bg-white p-3 shadow-xl hover:shadow-2xl"
            >
              <div className="relative h-60 w-full overflow-hidden rounded-2xl bg-stone-100">
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B1712]/85 via-[#1B1712]/15 to-transparent" />

                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[10.5px] font-bold text-[#1B1712] backdrop-blur-md shadow-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D98A2B] animate-pulse" />
                  {card.tag}
                </div>

                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 text-white">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#D98A2B]">
                    {card.category}
                  </span>
                  <h3 className="font-serif text-lg font-semibold leading-tight">{card.title}</h3>
                  <p className="mt-0.5 text-[11.5px] opacity-90 truncate">{card.tagline}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between px-1 text-[12px]">
                <span className="font-bold text-[#1B1712]">Tap to explore menu</span>
                <span className="flex items-center text-[#B96F1A] font-semibold gap-1">
                  Next Card <IconChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <div className="absolute -bottom-8 inset-x-0 flex items-center justify-center gap-2">
        <button
          onClick={rotateStack}
          className="rounded-full border border-[#ECE7DD] bg-white px-4 py-1.5 text-[11.5px] font-bold text-[#1B1712] shadow-sm hover:bg-[#F7F5EF] transition-colors"
        >
          🔄 Swipe Stack
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------- Skeleton Loader ---------------------------------- */

function RestaurantsSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-20 border-b border-[#ECE7DD] sm:px-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="w-64 h-8 rounded-full animate-pulse bg-[#F2EEE4]" />
          <div className="w-96 h-12 rounded-2xl animate-pulse bg-[#F2EEE4]" />
          <div className="w-full max-w-xl h-12 rounded-full animate-pulse bg-[#F2EEE4]" />
        </div>
      </div>
      <div className="max-w-6xl px-4 py-10 mx-auto sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden bg-white border rounded-2xl border-[#ECE7DD]">
              <div className="w-full h-48 animate-pulse bg-[#F2EEE4]" />
              <div className="p-4 space-y-3">
                <div className="w-3/4 h-5 rounded-full animate-pulse bg-[#F2EEE4]" />
                <div className="w-1/2 h-3.5 rounded-full animate-pulse bg-[#F2EEE4]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Quick View Modal ---------------------------------- */

function QuickViewModal({ restaurant, onClose }) {
  if (!restaurant) return null;
  const rating = restaurant.rating?.avg;
  const openNow = isRestaurantOpenNow(restaurant);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#1B1712]/50 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ type: "spring", stiffness: 360, damping: 28 }}
          className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-[#ECE7DD] bg-white shadow-2xl"
        >
          <div className="relative h-52 w-full bg-[#F7F5EF]">
            {restaurant.images?.[0] ? (
              <img
                src={getImageUrl(restaurant.images[0])}
                alt={restaurant.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[#C9BFA9]">
                <IconUtensils className="w-10 h-10" />
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#1B1712] shadow-md hover:scale-105"
            >
              <IconX className="w-4 h-4" />
            </button>
            <div className="absolute left-4 bottom-4">
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider ${openNow ? "bg-[#4B5D45]" : "bg-stone-600"}`}>
                {openNow ? "Open Now" : "Closed"}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl font-semibold text-[#1B1712]">{restaurant.name}</h3>
                <p className="mt-1 text-[13.5px] text-[#8A8072]">
                  {restaurant.cuisineType?.join(" · ") || "Various cuisines"}
                </p>
              </div>
              {rating && (
                <div className="flex items-center gap-1 rounded-xl bg-[#1B1712] px-3 py-1 text-white">
                  <IconStar className="w-4 h-4 text-[#D98A2B]" />
                  <span className="text-[13px] font-bold">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 border-y border-[#ECE7DD] py-4 text-[13px]">
              <div>
                <span className="block text-[11px] font-medium text-[#A69C8C] uppercase tracking-wider">City</span>
                <span className="font-semibold text-[#1B1712]">{restaurant.address?.city || "Location available"}</span>
              </div>
              <div>
                <span className="block text-[11px] font-medium text-[#A69C8C] uppercase tracking-wider">Order Option</span>
                <span className="font-semibold text-[#4B5D45]">Express Delivery</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <FavoriteButton restaurantId={restaurant._id} />
              <Link
                to={`/restaurants/${restaurant._id}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1B1712] py-3 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#D98A2B]"
              >
                <span>Explore Full Menu</span>
                <IconChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.045, duration: 0.5, ease: EASE } }),
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

function RestaurantCard({ r, index, onQuickView }) {
  const rating = r.rating?.avg;
  const openNow = isRestaurantOpenNow(r);

  return (
    <motion.div layout custom={index} variants={cardVariants} initial="hidden" animate="show" exit="exit">
      <div className="group relative flex flex-col overflow-hidden rounded-[20px] border border-[#ECE7DD] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#D98A2B]/40 hover:shadow-xl">
        <div className="relative w-full overflow-hidden h-48 bg-[#F7F5EF]">
          <Link to={`/restaurants/${r._id}`}>
            {r.images?.[0] ? (
              <img
                src={getImageUrl(r.images[0])}
                alt={r.name}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-[1.04]"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={`pointer-events-none flex h-full w-full flex-col items-center justify-center gap-1.5 text-[#8A8072] bg-[#F2EEE4] ${
                r.images?.[0] ? "hidden" : "flex"
              }`}
            >
              <IconUtensils className="w-7 h-7 text-[#A69C8C]" />
              <span className="text-[12px] font-semibold text-[#1B1712]">{r.name}</span>
            </div>
          </Link>

          <button
            onClick={() => onQuickView(r)}
            className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-[#ECE7DD] bg-white px-3 py-1 text-[11px] font-semibold text-[#1B1712] opacity-0 transition-opacity duration-200 group-hover:opacity-100 shadow-md hover:bg-[#F7F5EF]"
          >
            <IconEye className="w-3.5 h-3.5 text-[#D98A2B]" />
            Quick view
          </button>

          <div className="absolute right-3 top-3 z-10">
            <FavoriteButton restaurantId={r._id} />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-[#1B1712]/90 via-[#1B1712]/40 to-transparent px-3.5 pb-3 pt-10">
            <span className="flex items-center gap-1.5 text-[11.5px] font-bold text-white">
              <span className={`h-2 w-2 rounded-full ${openNow ? "bg-emerald-400" : "bg-red-400"}`} />
              {openNow ? "Open now" : "Closed"}
            </span>
            {rating ? (
              <span className="flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11.5px] font-extrabold text-[#1B1712] shadow-sm">
                <IconStar className="w-3.5 h-3.5 text-[#D98A2B]" />
                {rating.toFixed(1)}
              </span>
            ) : (
              <span className="rounded-md bg-[#D98A2B] px-2 py-0.5 text-[10.5px] font-extrabold text-white shadow-sm">
                New
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-1 p-5 bg-white">
          <Link to={`/restaurants/${r._id}`}>
            <h3 className="truncate text-[16px] font-bold leading-snug text-[#1B1712] hover:text-[#B96F1A] transition-colors">
              {r.name}
            </h3>
          </Link>
          <p className="mt-1 truncate text-[13px] font-medium text-[#6B6355]">
            {r.cuisineType?.join(" · ") || "Various Cuisines"}
          </p>
          <div className="mt-3 flex items-center gap-1 border-t border-[#ECE7DD] pt-3 text-[12px] text-[#8A8072]">
            <IconMapPin className="h-3.5 w-3.5 text-[#A69C8C] shrink-0" />
            <span className="truncate text-[#1B1712] font-semibold">{r.address?.city || "Location unavailable"}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------------------------- Main Restaurants Component ---------------------------------- */

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [activeCuisine, setActiveCuisine] = useState("all");
  const [openOnly, setOpenOnly] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [pinned, setPinned] = useState(false);

  const gridRef = useRef(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axiosInstance.get("/restaurants");
        setRestaurants(res.data.data.restaurants || []);
      } catch (err) {
        setError(err.response?.data?.message || "Couldn't load restaurants.");
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setPinned(!entry.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const cuisines = useMemo(() => {
    const set = new Set();
    restaurants.forEach((r) => (r.cuisineType || []).forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [restaurants]);

  const cities = useMemo(() => {
    const set = new Set();
    restaurants.forEach((r) => r.address?.city && set.add(r.address.city));
    return Array.from(set).sort();
  }, [restaurants]);

  const openCount = useMemo(() => restaurants.filter((r) => isRestaurantOpenNow(r)).length, [restaurants]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = restaurants.filter((r) => {
      const cuisineStr = (r.cuisineType || []).join(" ").toLowerCase();
      const matchesQuery = !q || r.name?.toLowerCase().includes(q) || cuisineStr.includes(q) || r.address?.city?.toLowerCase().includes(q);
      const matchesCuisine = activeCuisine === "all" || (r.cuisineType || []).includes(activeCuisine);
      const matchesOpen = !openOnly || isRestaurantOpenNow(r);
      return matchesQuery && matchesCuisine && matchesOpen;
    });

    if (sortBy === "rating") list = [...list].sort((a, b) => (b.rating?.avg || 0) - (a.rating?.avg || 0));
    else if (sortBy === "name") list = [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return list;
  }, [restaurants, query, activeCuisine, openOnly, sortBy]);

  if (loading) return <RestaurantsSkeleton />;

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label;
  const filtersActive = activeCuisine !== "all" || openOnly || sortBy !== "relevance" || query;

  const clearAll = () => {
    setQuery("");
    setActiveCuisine("all");
    setOpenOnly(false);
    setSortBy("relevance");
  };

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-white text-[#1B1712]">
      {/* ---------------------------------- Hero Header ---------------------------------- */}
      <div className="relative overflow-hidden bg-white border-b border-[#ECE7DD]">
        <div className="relative max-w-4xl px-4 pt-16 pb-20 mx-auto sm:px-6 sm:pt-20 sm:pb-20 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B96F1A]"
          >
            <span className="h-px w-6 bg-[#B96F1A]" />
            Premium Food Delivery
            <span className="h-px w-6 bg-[#B96F1A]" />
          </motion.span>

          <h1 className="mt-4 font-serif text-[42px] font-medium leading-[1.12] tracking-tight text-[#1B1712] sm:text-[56px]">
            <SplitBlurText text="Discover Top Rated" delay={0.06} />
            <br />
            <span className="relative inline-block text-[#B96F1A]">
              <SplitBlurText text="Local Restaurants." delay={0.06} />
              <DrawnUnderline />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-4 mx-auto max-w-xl text-[15.5px] leading-relaxed text-[#6B6355]"
          >
            Order from {restaurants.length > 0 ? restaurants.length : "dozens of"} handpicked restaurants across {cities.length || 1} {cities.length === 1 ? "city" : "cities"} with live express delivery.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="mt-8 mx-auto flex max-w-2xl flex-col gap-2 rounded-2xl border border-[#ECE7DD] bg-white p-2 shadow-[0_16px_40px_-24px_rgba(27,23,18,0.25)] sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A69C8C]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurants, cuisines, cities"
                className="w-full rounded-xl py-3 pl-10 pr-3 text-[14px] text-[#1B1712] placeholder:text-[#A69C8C] focus:outline-none"
              />
            </div>
            <button
              onClick={scrollToGrid}
              className="shrink-0 rounded-xl bg-[#1B1712] px-6 py-3 text-[13.5px] font-semibold text-white transition-all duration-300 hover:bg-[#D98A2B] hover:shadow-lg active:scale-95"
            >
              Find Restaurants
            </button>
          </motion.div>

          {/* Quick Categories Bar */}
          <div className="mt-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A69C8C]">Popular Craving Categories</span>
            <div className="mt-4 flex justify-center flex-wrap gap-3">
              {FOOD_CATEGORIES.map((cat, idx) => (
                <motion.button
                  key={cat.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setQuery(cat.name);
                    scrollToGrid();
                  }}
                  className="group flex items-center gap-2.5 rounded-xl border border-[#ECE7DD] bg-white p-2 pr-4 shadow-sm transition-all hover:border-[#D98A2B]/40 hover:shadow-md"
                >
                  <img src={cat.image} alt={cat.name} className="h-8 w-8 rounded-lg object-cover transition-transform group-hover:rotate-3" />
                  <span className="text-[13px] font-semibold text-[#1B1712] group-hover:text-[#B96F1A]">{cat.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div ref={sentinelRef} />

      {/* ---------------------------------- Filter Bar ---------------------------------- */}
      {restaurants.length > 0 && (
        <div
          className={`sticky top-0 z-20 border-b bg-white/90 backdrop-blur-md transition-shadow duration-300 ${
            pinned ? "border-[#ECE7DD] shadow-[0_8px_24px_-16px_rgba(27,23,18,0.15)]" : "border-transparent"
          }`}
        >
          <div className="max-w-6xl px-4 py-3.5 mx-auto sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A69C8C]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter name, cuisine..."
                  className="w-full rounded-full border border-[#ECE7DD] bg-white py-2 pl-9 pr-8 text-[13px] text-[#1B1712] transition-all duration-200 placeholder:text-[#A69C8C] focus:border-[#D98A2B] focus:outline-none"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-2.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-[#A69C8C] hover:text-[#1B1712]"
                  >
                    <IconX className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="relative flex-1 min-w-0">
                <div className="scrollbar-none flex gap-2 overflow-x-auto pb-0.5 pr-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <button
                    onClick={() => setActiveCuisine("all")}
                    className={`shrink-0 rounded-full border px-4 py-2 text-[12.5px] font-semibold transition-colors duration-200 ${
                      activeCuisine === "all"
                        ? "border-[#1B1712] bg-[#1B1712] text-white"
                        : "border-[#ECE7DD] bg-white text-[#6B6355] hover:border-[#D98A2B]/40"
                    }`}
                  >
                    All Cuisines
                  </button>
                  <button
                    onClick={() => setOpenOnly((v) => !v)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-[12.5px] font-semibold transition-colors duration-200 ${
                      openOnly
                        ? "border-[#4B5D45] bg-[#4B5D45]/10 text-[#3F4B3D]"
                        : "border-[#ECE7DD] bg-white text-[#6B6355] hover:border-[#D98A2B]/40"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${openOnly ? "bg-[#4B5D45]" : "bg-[#C9BFA9]"}`} />
                    Open now
                  </button>
                  {cuisines.map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveCuisine(c === activeCuisine ? "all" : c)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-[12.5px] font-semibold transition-colors duration-200 ${
                        activeCuisine === c
                          ? "border-[#D98A2B] bg-[#D98A2B]/10 text-[#B96F1A]"
                          : "border-[#ECE7DD] bg-white text-[#6B6355] hover:border-[#D98A2B]/40"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative self-start shrink-0 sm:self-auto">
                <button
                  onClick={() => setSortMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#ECE7DD] bg-white px-4 py-2 text-[12.5px] font-semibold text-[#6B6355] transition-colors duration-200 hover:border-[#D98A2B]/40"
                >
                  {activeSortLabel}
                  <IconChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${sortMenuOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {sortMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setSortMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -6 }}
                        className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-xl border border-[#ECE7DD] bg-white py-1.5 shadow-[0_20px_48px_-16px_rgba(27,23,18,0.2)]"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setSortBy(opt.value);
                              setSortMenuOpen(false);
                            }}
                            className={`block w-full px-4 py-2 text-left text-[13px] transition-colors hover:bg-[#F7F5EF] ${
                              sortBy === opt.value ? "font-semibold text-[#B96F1A]" : "text-[#3A322A]"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {filtersActive && (
              <div className="mt-3 flex items-center gap-2 text-[12px] text-[#8A8072]">
                <span>Showing <strong>{filtered.length}</strong> restaurant{filtered.length === 1 ? "" : "s"}</span>
                <span className="text-[#C9BFA9]">·</span>
                <button onClick={clearAll} className="font-semibold text-[#1B1712] underline hover:text-[#D98A2B]">
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------- Grid ---------------------------------- */}
      <div ref={gridRef} className="max-w-6xl px-4 py-10 mx-auto sm:px-6 scroll-mt-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-[24px] font-semibold text-[#1B1712]">
              {activeCuisine === "all" ? "All Restaurants" : activeCuisine}
            </h2>
            <p className="mt-1 text-[13px] text-[#8A8072]">
              {restaurants.length > 0 ? `${openCount} restaurants open now` : "Explore places near you"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
            {error}
          </div>
        )}

        {restaurants.length === 0 ? (
          <div className="p-16 text-center bg-white border rounded-3xl border-[#ECE7DD]">
            <p className="text-[15px] font-medium text-[#8A8072]">No restaurants listed yet.</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-16 text-center bg-white border rounded-3xl border-[#ECE7DD]"
          >
            <div className="flex items-center justify-center mx-auto mb-4 rounded-full h-14 w-14 bg-[#F7F5EF]">
              <IconSearchOff className="w-6 h-6 text-[#A69C8C]" />
            </div>
            <h3 className="text-[16px] font-bold text-[#1B1712]">
              No restaurants found{query ? ` matching "${query}"` : ""}
            </h3>
            <p className="mt-1 text-[13.5px] text-[#8A8072]">Try clearing your search or active filters.</p>
            <button
              onClick={clearAll}
              className="mt-5 rounded-full bg-[#1B1712] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#D98A2B] transition-colors"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((r, idx) => (
                <RestaurantCard key={r._id} r={r} index={idx} onQuickView={(item) => setQuickViewItem(item)} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ---------------------------------- Key Metrics ---------------------------------- */}
      {restaurants.length > 0 && (
        <div className="border-t border-[#ECE7DD] bg-[#FAF8F5] py-16">
          <div className="grid max-w-6xl grid-cols-1 gap-8 px-4 mx-auto sm:grid-cols-3 sm:px-6 text-center">
            <div>
              <p className="font-serif text-[32px] font-semibold text-[#1B1712]">
                <AnimatedNumber value={restaurants.length} suffix="+" />
              </p>
              <p className="mt-1 text-[13px] font-medium text-[#8A8072]">Partner Restaurants</p>
            </div>
            <div>
              <p className="font-serif text-[32px] font-semibold text-[#1B1712]">
                <AnimatedNumber value={cuisines.length} suffix="+" />
              </p>
              <p className="mt-1 text-[13px] font-medium text-[#8A8072]">Unique Cuisines</p>
            </div>
            <div>
              <p className="font-serif text-[32px] font-semibold text-[#1B1712]">
                <AnimatedNumber value={openCount} />
              </p>
              <p className="mt-1 text-[13px] font-medium text-[#8A8072]">Open Right Now</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal restaurant={quickViewItem} onClose={() => setQuickViewItem(null)} />
    </div>
  );
}

export default Restaurants;