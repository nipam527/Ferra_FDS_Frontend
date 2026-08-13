// src/pages/Restaurants.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import axiosInstance from "../api/axiosInstance";
import { getImageUrl } from "../utils/getImageUrl";
import FavoriteButton from "../components/FavoriteButton";
import { isRestaurantOpenNow } from "../utils/isRestaurantOpen";

/* ------------------------------------------------------------------------ */
/*  Palette — pure white canvas, near-black ink, one marigold accent,       */
/*  a quiet olive for secondary states. No tinted section backgrounds;      */
/*  separation comes from whitespace and hairline borders instead.          */
/*    ink        #1B1712      paper      #FFFFFF     line       #ECE7DD    */
/*    marigold   #D98A2B      marigold-d #B96F1A      olive     #4B5D45    */
/* ------------------------------------------------------------------------ */

const EASE = [0.16, 1, 0.3, 1];

/* ---------------------------------- Icons ---------------------------------- */

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
function IconUtensils(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 2v8a2 2 0 0 0 4 0V2M8 10v12M18 2c-2 1-3 3-3 6s1 3 3 3v11" />
    </svg>
  );
}
function IconClipboardList(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="5" y="3.5" width="14" height="17" rx="2" />
      <path d="M9 3.5V3a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 3v.5M8.5 9h7M8.5 13h7M8.5 17h4.5" />
    </svg>
  );
}
function IconTruck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 7h11v9H2zM13 10h4l3 3v3h-7z" />
      <circle cx="6.5" cy="18" r="1.7" />
      <circle cx="16.5" cy="18" r="1.7" />
    </svg>
  );
}
function IconWheat(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22V9M12 9c-2-1-2-3-1-4.5C12 9 13 7 11 4.5c1 1.5 1 3.5-1 4.5Zm-3.5 2c-1.5-.8-2-2.5-1.2-4C9 9.3 9.5 7.7 8 6c.7 1.4.6 3-1.2 5.1Zm7 0c1.5-.8 2-2.5 1.2-4C15 9.3 14.5 7.7 16 6c-.7 1.4-.6 3 1.2 5.1ZM12 22c-2.2 0-3.5-1.3-3.5-3M12 22c2.2 0 3.5-1.3 3.5-3" />
    </svg>
  );
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Rating, high to low" },
  { value: "name", label: "Name, A–Z" },
];

const CUISINE_ICONS = [IconWheat, IconUtensils, IconStar, IconTruck];

const STEPS = [
  { icon: IconClipboardList, title: "Pick a restaurant", desc: "Browse by cuisine, city or rating to find today's craving." },
  { icon: IconUtensils, title: "Choose your dish", desc: "Explore the menu and add favorites in a couple of taps." },
  { icon: IconTruck, title: "Sit back & enjoy", desc: "Track your order as it's prepared and delivered fresh." },
];

const prefersReducedMotion =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------- Animated counter ---------------------------------- */

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

/* ---------------------------------- Drawn underline ---------------------------------- */

function DrawnUnderline() {
  return (
    <svg
      viewBox="0 0 210 14"
      className="pointer-events-none absolute -bottom-1.5 left-0 h-[0.4em] w-full"
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
        transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
      />
    </svg>
  );
}

/* ---------------------------------- Skeleton ---------------------------------- */

function RestaurantsSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-24 border-b border-[#ECE7DD] sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="w-72 h-8 rounded-full animate-pulse bg-[#F2EEE4]" />
          <div className="w-56 h-4 mt-3 rounded-full animate-pulse bg-[#F2EEE4]" />
          <div className="w-full max-w-xl h-12 mt-8 rounded-full animate-pulse bg-[#F2EEE4]" />
        </div>
      </div>
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden bg-white border rounded-2xl border-[#ECE7DD]">
              <div className="w-full h-44 animate-pulse bg-[#F2EEE4]" />
              <div className="p-4 space-y-2">
                <div className="w-3/4 h-4 rounded-full animate-pulse bg-[#F2EEE4]" />
                <div className="w-1/2 h-3 rounded-full animate-pulse bg-[#F2EEE4]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Reusable cursor-reactive tilt wrapper for the step cards */
function TiltCard({ children, isActive, onMouseEnter }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -4, y: px * 6 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseEnter={onMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        borderColor: isActive ? "#D98A2B33" : "#ECE7DD00",
      }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      style={{ transformPerspective: 800 }}
      className="p-4 -m-4 border rounded-2xl"
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------- How it works (scroll-driven) ---------------------------------- */

function HowItWorks() {
  const sectionRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 75%", "end 40%"],
  });

  // Line fills based on real scroll position through the section
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Drive the active step + preview panel off the same scroll progress
  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      const idx = Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length)));
      setActiveStep(idx);
    });
  }, [scrollYProgress]);

  return (
    <div ref={sectionRef} className="border-t border-b border-[#ECE7DD]">
      <div className="max-w-6xl px-4 py-20 mx-auto sm:px-6">
        <div className="flex items-baseline justify-between">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="font-serif text-[22px] font-medium tracking-tight text-[#1B1712]"
          >
            How ordering works
          </motion.h2>
          <span className="hidden text-[12px] text-[#A69C8C] sm:inline">Scroll to see it play out</span>
        </div>

        <div className="grid grid-cols-1 gap-16 mt-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          {/* ---------------- Left: steps with real scroll-linked line ---------------- */}
          <div className="relative pl-10">
            {/* base track */}
            <div className="absolute left-[15px] top-1 bottom-1 w-px bg-[#ECE7DD]" />
            {/* fill, driven by scroll */}
            <motion.div
              style={{ scaleY: lineScale }}
              className="absolute left-[15px] top-1 bottom-1 w-px origin-top bg-gradient-to-b from-[#D98A2B] to-[#4B5D45]"
            />

            <div className="flex flex-col gap-12">
              {STEPS.map((s, i) => {
                const isActive = i === activeStep;
                return (
                  <TiltCard
                    key={s.title}
                    isActive={isActive}
                    onMouseEnter={() => setActiveStep(i)}
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        animate={{
                          backgroundColor: isActive ? "#1B1712" : "#FFFFFF",
                          borderColor: isActive ? "#1B1712" : "#ECE7DD",
                          scale: isActive ? 1.06 : 1,
                        }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="relative z-10 flex items-center justify-center w-8 h-8 border rounded-full shrink-0"
                      >
                        <motion.span
                          animate={{ color: isActive ? "#FFFFFF" : "#1B1712" }}
                          transition={{ duration: 0.3 }}
                          className="text-[11px] font-semibold"
                        >
                          {i + 1}
                        </motion.span>
                        {isActive && (
                          <motion.span
                            layoutId="active-step-ring"
                            className="absolute -inset-1.5 rounded-full border border-[#D98A2B]/40"
                            transition={{ type: "spring", stiffness: 300, damping: 26 }}
                          />
                        )}
                      </motion.div>

                      <div>
                        <motion.h3
                          animate={{ color: isActive ? "#1B1712" : "#6B6355" }}
                          transition={{ duration: 0.3 }}
                          className="text-[16px] font-semibold"
                        >
                          {s.title}
                        </motion.h3>
                        <motion.p
                          animate={{ opacity: isActive ? 1 : 0.65 }}
                          transition={{ duration: 0.3 }}
                          className="mt-1.5 max-w-[300px] text-[13px] leading-relaxed text-[#8A8072]"
                        >
                          {s.desc}
                        </motion.p>
                      </div>
                    </div>
                  </TiltCard>
                );
              })}
            </div>
          </div>

          {/* ---------------- Right: live preview panel synced to active step ---------------- */}
          <div className="relative hidden aspect-[4/3] w-full overflow-hidden rounded-[24px] border border-[#ECE7DD] bg-[#F7F5EF] lg:block">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-5"
              >
                <motion.div
                  initial={{ scale: 0.7, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.05 }}
                  className="flex items-center justify-center border rounded-full h-20 w-20 bg-white/80 border-[#ECE7DD] shadow-[0_20px_50px_-20px_rgba(27,23,18,0.25)]"
                >
                  {(() => {
                    const Icon = STEPS[activeStep].icon;
                    return <Icon className="w-8 h-8 text-[#D98A2B]" />;
                  })()}
                </motion.div>
                <div className="text-center">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B96F1A]">
                    Step {activeStep + 1}
                  </span>
                  <h4 className="mt-2 font-serif text-[22px] font-medium text-[#1B1712]">
                    {STEPS[activeStep].title}
                  </h4>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* progress dots for the preview panel */}
            <div className="absolute z-10 flex gap-1.5 -translate-x-1/2 bottom-5 left-1/2">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeStep ? "w-5 bg-[#1B1712]" : "w-1.5 bg-[#1B1712]/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Rotating hero image ---------------------------------- */

// Pulls a fresh food photo every few seconds so the hero never feels static.
// Falls back to a quiet placeholder if the network call fails (offline, blocked, etc).

function RotatingFoodImage() {
  const images = [
    "/food1.webp",
    "/food2.webp",
    "/food3.webp",
    "/food-4.jpg",
    "/food-5.jpg",
  ];

  const DURATION = 4500; // ms per image

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Preload all images up front so there's never a flash of blank/broken image
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      images.map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = resolve;
            img.onerror = resolve; // don't block on a bad image
          })
      )
    ).then(() => {
      if (!cancelled) setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, DURATION);
    return () => clearInterval(interval);
  }, [images.length, isPaused]);

  return (
    <div
      className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] border border-[#ECE7DD] bg-[#F7F5EF]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Crossfade stack: mode="sync" (default) lets exit+enter overlap = no gap */}
      <AnimatePresence initial={false}>
        {loaded && (
          <motion.img
            key={images[currentIndex]}
            src={images[currentIndex]}
            alt="Featured dish"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { duration: 1.1, ease: EASE },
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.9, ease: EASE },
            }}
            className="absolute inset-0 object-cover w-full h-full"
            style={{ willChange: "opacity, transform" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
      </AnimatePresence>

      {/* Soft skeleton shimmer while images preload */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-[#F2EEE4]" />
      )}

      {/* Dark gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1B1712]/35 via-transparent to-transparent" />

      {/* Label */}
      <div className="absolute bottom-4 left-4 px-3 py-1.5 text-[11px] font-medium text-white rounded-full bg-[#1B1712]/70 backdrop-blur-sm">
        Fresh off the menu
      </div>

      {/* Progress-bar style indicators (premium feel, shows real timing) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
        {images.map((_, index) => (
          <div
            key={index}
            className="relative w-6 h-1 overflow-hidden rounded-full bg-white/30"
          >
            {index === currentIndex && !isPaused && (
              <motion.div
                key={`${currentIndex}-${isPaused}`}
                className="absolute inset-y-0 left-0 bg-white rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: DURATION / 1000, ease: "linear" }}
              />
            )}
            {index < currentIndex && (
              <div className="absolute inset-0 bg-white rounded-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- Card ---------------------------------- */

const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: Math.min(i, 8) * 0.045, duration: 0.5, ease: EASE },
  }),
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

function RestaurantCard({ r, index }) {
  const rating = r.rating?.avg;
  const openNow = isRestaurantOpenNow(r);

  return (
    <motion.div layout custom={index} variants={cardVariants} initial="hidden" animate="show" exit="exit">
      <Link
        to={`/restaurants/${r._id}`}
        className="group relative flex flex-col overflow-hidden rounded-[20px] border border-[#ECE7DD] bg-white transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-[#D98A2B]/50 hover:shadow-[0_24px_48px_-20px_rgba(27,23,18,0.18)]"
      >
        <div className="relative w-full overflow-hidden h-44 bg-[#F7F5EF]">
          {r.images?.[0] ? (
            <img
              src={getImageUrl(r.images[0])}
              alt={r.name}
              className="object-cover w-full h-full transition-transform duration-700 ease-out pointer-events-none group-hover:scale-[1.08]"
            />
          ) : (
            <div className="pointer-events-none flex h-full w-full flex-col items-center justify-center gap-1.5 text-[#C9BFA9]">
              <IconImageOff className="w-6 h-6" />
              <span className="text-[11px] font-medium">No image</span>
            </div>
          )}

          {!r.isOpen && <div className="absolute inset-0 pointer-events-none bg-white/55" />}

          <div className="absolute right-2.5 top-2.5 z-10">
            <FavoriteButton restaurantId={r._id} />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-[#1B1712]/80 via-[#1B1712]/10 to-transparent px-3 pb-2.5 pt-8">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-white">
              <span className={`h-1.5 w-1.5 rounded-full ${r.isOpen ? "bg-emerald-400" : "bg-white/40"}`} />
              {openNow ? "Open now" : "Closed"}
            </span>
            {rating ? (
              <span className="flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-0.5 text-[11px] font-semibold text-[#1B1712]">
                <IconStar className="w-3 h-3 text-[#D98A2B]" />
                {rating.toFixed(1)}
              </span>
            ) : (
              <span className="rounded-md bg-[#D98A2B] px-1.5 py-0.5 text-[10.5px] font-semibold text-white">
                New
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-1 p-4 pointer-events-none">
          <h2 className="truncate text-[15px] font-semibold leading-tight text-[#1B1712]">{r.name}</h2>
          <p className="truncate text-[12.5px] text-[#8A8072]">
            {r.cuisineType?.join(" · ") || "Various cuisines"}
          </p>
          <span className="mt-1.5 flex items-center gap-1 text-[12px] text-[#A69C8C]">
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
  const gridRef = useRef(null);
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

  const cities = useMemo(() => {
    const set = new Set();
    restaurants.forEach((r) => r.address?.city && set.add(r.address.city));
    return Array.from(set).sort();
  }, [restaurants]);

  const openCount = useMemo(
    () => restaurants.filter((r) => isRestaurantOpenNow(r)).length,
    [restaurants]
  );

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
    <div className="min-h-screen bg-white">
      {/* ---------------------------------- Hero ---------------------------------- */}
      <div className="relative overflow-hidden bg-white">
        {/* one quiet signature shape — a soft marigold bloom, nothing louder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: EASE }}
          className="absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(217,138,43,0.10),transparent_70%)] pointer-events-none"
        />

        <div className="relative max-w-6xl px-4 pt-20 pb-24 mx-auto sm:px-6 sm:pt-28 sm:pb-28">
          <div className="grid items-start grid-cols-1 gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Left column: copy, search, cuisine picks */}
            <div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B96F1A]"
              >
                <span className="h-px w-6 bg-[#B96F1A]" />
                Delivered fresh
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
                className="mt-5 max-w-lg font-serif text-[40px] font-medium leading-[1.1] tracking-tight text-[#1B1712] sm:text-[50px]"
              >
                Enjoy your{" "}
                <span className="relative inline-block">
                  delicious meal
                  <DrawnUnderline />
                </span>
                , delivered fresh
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.16, ease: EASE }}
                className="mt-6 max-w-md text-[15px] leading-relaxed text-[#6B6355]"
              >
                {restaurants.length > 0
                  ? `${restaurants.length} restaurant${restaurants.length === 1 ? "" : "s"} across ${cities.length || 1} ${cities.length === 1 ? "city" : "cities"}, ready to take your order.`
                  : "Discover great restaurants and get your favorite food delivered to your door."}
              </motion.p>

              {/* Search card */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.24, ease: EASE }}
                whileHover={{ y: -2 }}
                className="mt-9 flex max-w-xl flex-col gap-2.5 rounded-2xl border border-[#ECE7DD] bg-white p-2 shadow-[0_16px_40px_-24px_rgba(27,23,18,0.25)] transition-shadow duration-300 hover:shadow-[0_24px_56px_-24px_rgba(27,23,18,0.3)] sm:flex-row sm:items-center"
              >
                <div className="relative flex-1">
                  <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A69C8C]" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search restaurants, cuisines, cities"
                    className="w-full rounded-xl py-3 pl-10 pr-3 text-[13.5px] text-[#1B1712] placeholder:text-[#A69C8C] focus:outline-none"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.025 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  onClick={scrollToGrid}
                  className="shrink-0 rounded-xl bg-[#1B1712] px-6 py-3 text-[13.5px] font-semibold text-white transition-colors duration-300 hover:bg-[#D98A2B]"
                >
                  Find a restaurant
                </motion.button>
              </motion.div>

              {cities.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.32 }}
                  className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#8A8072]"
                >
                  <span>Popular:</span>
                  {cities.slice(0, 5).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setQuery(c);
                        scrollToGrid();
                      }}
                      className="text-[#1B1712] underline-offset-4 transition-colors hover:text-[#B96F1A] hover:underline"
                    >
                      {c}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Category quick picks — sit below the search bar, driven by real cuisine data */}
              {cuisines.length > 0 && (
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.36 } } }}
                  className="grid max-w-xl grid-cols-2 gap-3.5 mt-8 sm:grid-cols-4"
                >
                  {cuisines.slice(0, 4).map((c, i) => {
                    const Icon = CUISINE_ICONS[i % CUISINE_ICONS.length];
                    const isActive = activeCuisine === c;
                    return (
                      <motion.button
                        key={c}
                        variants={{
                          hidden: { opacity: 0, y: 18, scale: 0.96 },
                          show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
                        }}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.25 }}
                        onClick={() => {
                          setActiveCuisine(isActive ? "all" : c);
                          scrollToGrid();
                        }}
                        className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-colors duration-300 ${
                          isActive
                            ? "border-[#D98A2B] bg-[#D98A2B]/[0.07] shadow-[0_16px_32px_-20px_rgba(217,138,43,0.5)]"
                            : "border-[#ECE7DD] bg-white hover:border-[#D98A2B]/40 hover:shadow-[0_16px_32px_-22px_rgba(27,23,18,0.2)]"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300 ${
                            isActive ? "bg-[#D98A2B] text-white" : "bg-[#F7F5EF] text-[#4B5D45]"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className={`text-[12.5px] font-medium leading-snug ${isActive ? "text-[#B96F1A]" : "text-[#1B1712]"}`}>
                          {c}
                        </span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {/* Right column: auto-rotating food image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
              className="hidden lg:block"
            >
              <RotatingFoodImage />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ---------------------------------- How it works ---------------------------------- */}
      <HowItWorks />
      <div ref={sentinelRef} />

      {/* ---------------------------------- Filter bar ---------------------------------- */}
      {restaurants.length > 0 && (
        <div
          className={`sticky top-0 z-20 border-b bg-white/90 backdrop-blur-md transition-shadow duration-300 ${
            pinned ? "border-[#ECE7DD] shadow-[0_8px_24px_-16px_rgba(27,23,18,0.15)]" : "border-transparent"
          }`}
        >
          <div className="max-w-6xl px-4 py-3 mx-auto sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A69C8C]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search restaurants, cuisines, cities"
                  className="w-full rounded-full border border-[#ECE7DD] bg-white py-2 pl-9 pr-8 text-[13px] text-[#1B1712] transition-all duration-200 placeholder:text-[#A69C8C] focus:border-[#D98A2B] focus:outline-none focus:ring-4 focus:ring-[#D98A2B]/10"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
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
                    className={`shrink-0 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors duration-200 ${
                      activeCuisine === "all"
                        ? "border-[#1B1712] bg-[#1B1712] text-white"
                        : "border-[#ECE7DD] bg-white text-[#6B6355] hover:border-[#D98A2B]/40"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setOpenOnly((v) => !v)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors duration-200 ${
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
                      className={`shrink-0 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors duration-200 ${
                        activeCuisine === c
                          ? "border-[#D98A2B] bg-[#D98A2B]/10 text-[#B96F1A]"
                          : "border-[#ECE7DD] bg-white text-[#6B6355] hover:border-[#D98A2B]/40"
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
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#ECE7DD] bg-white px-3.5 py-2 text-[12.5px] font-medium text-[#6B6355] transition-colors duration-200 hover:border-[#D98A2B]/40"
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
                        transition={{ type: "spring", stiffness: 420, damping: 30 }}
                        className="absolute right-0 z-30 mt-2 w-48 origin-top-right overflow-hidden rounded-xl border border-[#ECE7DD] bg-white py-1.5 shadow-[0_20px_48px_-16px_rgba(27,23,18,0.2)]"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setSortBy(opt.value);
                              setSortMenuOpen(false);
                            }}
                            className={`block w-full px-3.5 py-2 text-left text-[13px] transition-colors hover:bg-[#F7F5EF] ${
                              sortBy === opt.value ? "font-medium text-[#B96F1A]" : "text-[#3A322A]"
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
              <div className="mt-2.5 flex items-center gap-2 text-[12px] text-[#8A8072]">
                <span>{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
                <span className="text-[#C9BFA9]">·</span>
                <button onClick={clearAll} className="font-medium text-[#3A322A] underline-offset-2 hover:text-[#1B1712] hover:underline">
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------- Grid ---------------------------------- */}
      <div ref={gridRef} className="max-w-6xl px-4 py-10 mx-auto sm:px-6 scroll-mt-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-serif text-[20px] font-medium tracking-tight text-[#1B1712]">
              {activeCuisine === "all" ? "All restaurants" : activeCuisine}
            </h2>
            <p className="mt-0.5 text-[12.5px] text-[#8A8072]">
              {restaurants.length > 0 ? `${openCount} open right now` : "Find something good to eat"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {restaurants.length === 0 ? (
          <div className="p-12 text-center bg-white border rounded-2xl border-[#ECE7DD]">
            <p className="text-[14px] text-[#8A8072]">No restaurants available right now.</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center bg-white border rounded-2xl border-[#ECE7DD]"
          >
            <div className="flex items-center justify-center mx-auto mb-4 rounded-full h-14 w-14 bg-[#F7F5EF]">
              <IconSearchOff className="w-6 h-6 text-[#A69C8C]" />
            </div>
            <h2 className="text-[15px] font-semibold text-[#1B1712]">
              No matches{query ? ` for "${query}"` : ""}
            </h2>
            <p className="mt-1.5 text-[13.5px] text-[#8A8072]">Try a different name, cuisine, or city.</p>
            <button
              onClick={clearAll}
              className="mt-4 rounded-full bg-[#1B1712] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#D98A2B]"
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

      {/* ---------------------------------- Stats strip ---------------------------------- */}
      {restaurants.length > 0 && (
        <div className="border-t border-[#ECE7DD]">
          <div className="grid max-w-6xl grid-cols-1 gap-8 px-4 mx-auto py-14 sm:grid-cols-3 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <p className="font-serif text-[30px] font-medium text-[#1B1712]">
                <AnimatedNumber value={restaurants.length} suffix="+" />
              </p>
              <p className="mt-1 text-[12.5px] text-[#8A8072]">Restaurants listed</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
            >
              <p className="font-serif text-[30px] font-medium text-[#1B1712]">
                <AnimatedNumber value={cuisines.length} suffix="+" />
              </p>
              <p className="mt-1 text-[12.5px] text-[#8A8072]">Cuisines to explore</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.16, ease: EASE }}
            >
              <p className="font-serif text-[30px] font-medium text-[#1B1712]">
                <AnimatedNumber value={openCount} />
              </p>
              <p className="mt-1 text-[12.5px] text-[#8A8072]">Open right now</p>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Restaurants;