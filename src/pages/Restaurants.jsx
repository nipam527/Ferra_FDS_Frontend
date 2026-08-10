// src/pages/Restaurants.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../api/axiosInstance";
import { getImageUrl } from "../utils/getImageUrl";
import FavoriteButton from "../components/FavoriteButton";

function IconStar(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.5 15 9l7 .9-5.1 4.8L18.2 21 12 17.4 5.8 21l1.3-6.3L2 9.9 9 9l3-6.5Z" />
    </svg>
  );
}
function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function IconX(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function IconImageOff(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 16 4.5-4.5a2 2 0 0 1 2.8 0L14 15" />
      <circle cx="9" cy="9" r="1.3" />
    </svg>
  );
}
function IconMapPin(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}
function IconSearchOff(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3M8 11h6" />
    </svg>
  );
}
function IconChevronDown(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Rating, high to low" },
  { value: "name", label: "Name, A–Z" },
];

/* ---------------------------------- Skeleton ---------------------------------- */

function RestaurantsSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-8 border-b border-stone-100 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="w-56 rounded h-7 animate-pulse bg-stone-100" />
          <div className="w-40 h-4 mt-2 rounded animate-pulse bg-stone-100" />
        </div>
      </div>
      <div className="px-4 py-3 border-b border-stone-100 sm:px-6">
        <div className="flex max-w-6xl gap-2 mx-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-24 h-8 rounded-full shrink-0 animate-pulse bg-stone-100" />
          ))}
        </div>
      </div>
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden border rounded-2xl border-stone-200">
              <div className="w-full h-44 animate-pulse bg-stone-100" />
              <div className="p-4 space-y-2">
                <div className="w-3/4 h-4 rounded animate-pulse bg-stone-100" />
                <div className="w-1/2 h-3 rounded animate-pulse bg-stone-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Card ---------------------------------- */

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: Math.min(i, 8) * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  }),
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

function RestaurantCard({ r, index }) {
  const rating = r.rating?.avg;

  return (
    <motion.div layout custom={index} variants={cardVariants} initial="hidden" animate="show" exit="exit">
      <Link
        to={`/restaurants/${r._id}`}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-xl hover:shadow-stone-900/[0.08]"
      >
        <div className="relative w-full overflow-hidden h-44 bg-stone-100">
          {r.images?.[0] ? (
            <img
              src={getImageUrl(r.images[0])}
              alt={r.name}
              className="object-cover w-full h-full transition-transform duration-500 ease-out pointer-events-none group-hover:scale-110"
            />
          ) : (
            <div className="pointer-events-none flex h-full w-full flex-col items-center justify-center gap-1.5 text-stone-300">
              <IconImageOff className="w-6 h-6" />
              <span className="text-[11px] font-medium">No image</span>
            </div>
          )}

          {!r.isOpen && <div className="absolute inset-0 pointer-events-none bg-white/60" />}

          {/* Favorite heart — top-right, above the image, not covered by pointer-events-none siblings */}
          <div className="absolute right-2.5 top-2.5 z-10">
            <FavoriteButton restaurantId={r._id} />
          </div>

          {/* Bottom gradient overlay carries status + rating directly on the image,
              like Zomato/Swiggy — separate floating badges read as decoration, this reads as data. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 via-black/10 to-transparent px-3 pb-2.5 pt-8">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-white">
              <span className={`h-1.5 w-1.5 rounded-full ${r.isOpen ? "bg-green-400" : "bg-stone-300"}`} />
              {r.isOpen ? "Open now" : "Closed"}
            </span>
            {rating ? (
              <span className="flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-0.5 text-[11px] font-semibold text-stone-800">
                <IconStar className="w-3 h-3 text-amber-500" />
                {rating.toFixed(1)}
              </span>
            ) : (
              <span className="rounded-md bg-amber-500/95 px-1.5 py-0.5 text-[10.5px] font-semibold text-white">
                New
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-1 p-4 pointer-events-none">
          <h2 className="truncate text-[15px] font-semibold leading-tight text-stone-900">{r.name}</h2>
          <p className="truncate text-[12.5px] text-stone-500">
            {r.cuisineType?.join(" · ") || "Various cuisines"}
          </p>
          <span className="mt-1.5 flex items-center gap-1 text-[12px] text-stone-400">
            <IconMapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{r.address?.city || "Location unavailable"}</span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ---------------------------------- Page ---------------------------------- */

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [activeCuisine, setActiveCuisine] = useState("all");
  const [openOnly, setOpenOnly] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axiosInstance.get("/restaurants");
        setRestaurants(res.data.data.restaurants);
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = restaurants.filter((r) => {
      const cuisineStr = (r.cuisineType || []).join(" ").toLowerCase();
      const matchesQuery =
        !q ||
        r.name?.toLowerCase().includes(q) ||
        cuisineStr.includes(q) ||
        r.address?.city?.toLowerCase().includes(q);
      const matchesCuisine = activeCuisine === "all" || (r.cuisineType || []).includes(activeCuisine);
      const matchesOpen = !openOnly || r.isOpen;
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-8 border-b border-stone-100 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-[24px] font-semibold tracking-tight text-stone-900">Restaurants near you</h1>
          <p className="mt-1 text-[13.5px] text-stone-500">
            {restaurants.length > 0
              ? `${restaurants.length} restaurant${restaurants.length === 1 ? "" : "s"} available`
              : "Find something good to eat"}
          </p>
        </div>
      </div>
      <div ref={sentinelRef} />

      {restaurants.length > 0 && (
        <div
          className={`sticky top-0 z-20 border-b bg-white/95 backdrop-blur-md transition-shadow duration-200 ${
            pinned ? "border-stone-200 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.12)]" : "border-stone-100"
          }`}
        >
          <div className="max-w-6xl px-4 py-3 mx-auto sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search restaurants, cuisines, cities"
                  className="w-full rounded-full border border-stone-200 py-2 pl-9 pr-8 text-[13px] text-stone-900 transition-colors placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-stone-400 hover:text-stone-700"
                  >
                    <IconX className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="relative flex-1 min-w-0">
                <div className="scrollbar-none flex gap-2 overflow-x-auto pb-0.5 pr-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <button
                    onClick={() => setActiveCuisine("all")}
                    className={`shrink-0 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors ${
                      activeCuisine === "all"
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setOpenOnly((v) => !v)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors ${
                      openOnly
                        ? "border-green-600 bg-green-50 text-green-700"
                        : "border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${openOnly ? "bg-green-500" : "bg-stone-300"}`} />
                    Open now
                  </button>
                  {cuisines.map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveCuisine(c === activeCuisine ? "all" : c)}
                      className={`shrink-0 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors ${
                        activeCuisine === c
                          ? "border-amber-600 bg-amber-50 text-amber-700"
                          : "border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="absolute top-0 right-0 w-6 h-full pointer-events-none bg-gradient-to-l from-white to-transparent" />
              </div>

              <div className="relative self-start shrink-0 sm:self-auto">
                <button
                  onClick={() => setSortMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-stone-200 px-3.5 py-2 text-[12.5px] font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50"
                >
                  {activeSortLabel}
                  <IconChevronDown className={`h-3.5 w-3.5 transition-transform ${sortMenuOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {sortMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setSortMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                        className="absolute right-0 z-30 mt-2 w-48 origin-top-right overflow-hidden rounded-xl border border-stone-200 bg-white py-1.5 shadow-lg shadow-stone-900/[0.08]"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setSortBy(opt.value);
                              setSortMenuOpen(false);
                            }}
                            className={`block w-full px-3.5 py-2 text-left text-[13px] hover:bg-stone-50 ${
                              sortBy === opt.value ? "font-medium text-amber-700" : "text-stone-700"
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
              <div className="mt-2.5 flex items-center gap-2 text-[12px] text-stone-500">
                <span>{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
                <span className="text-stone-300">·</span>
                <button onClick={clearAll} className="font-medium text-stone-600 underline-offset-2 hover:text-stone-900 hover:underline">
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {restaurants.length === 0 ? (
          <div className="p-12 text-center border rounded-2xl border-stone-200">
            <p className="text-[14px] text-stone-500">No restaurants available right now.</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center border rounded-2xl border-stone-200"
          >
            <div className="flex items-center justify-center mx-auto mb-4 rounded-full h-14 w-14 bg-stone-50">
              <IconSearchOff className="w-6 h-6 text-stone-400" />
            </div>
            <h2 className="text-[15px] font-semibold text-stone-900">
              No matches{query ? ` for "${query}"` : ""}
            </h2>
            <p className="mt-1.5 text-[13.5px] text-stone-500">Try a different name, cuisine, or city.</p>
            <button
              onClick={clearAll}
              className="mt-4 rounded-full bg-stone-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-stone-800"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((r, idx) => (
                <RestaurantCard key={r._id} r={r} index={idx} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Restaurants;