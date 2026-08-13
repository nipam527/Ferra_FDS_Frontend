// src/pages/RestaurantDetail.jsx
import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../utils/getImageUrl";
import FavoriteButton from "../components/FavoriteButton";
import { isRestaurantOpenNow } from "../utils/isRestaurantOpen";

function IconStar(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.5 15 9l7 .9-5.1 4.8L18.2 21 12 17.4 5.8 21l1.3-6.3L2 9.9 9 9l3-6.5Z" />
    </svg>
  );
}
function IconClock(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}
function IconMapPin(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}
function IconPlus(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconArrowLeft(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 19-7-7 7-7M5 12h14" />
    </svg>
  );
}
function IconBag(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8h12l-1 12.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20.5L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
function IconImageOff(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 5h13l3 3v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      <path d="m8 13 2.5-2.5L14 14l2-2 4 4" />
      <circle cx="9" cy="9" r="1.3" />
    </svg>
  );
}
function IconMessageOff(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
    </svg>
  );
}

const currency = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);
const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

const AVATAR_TONES = [
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
];
const avatarTone = (seed = "") =>
  AVATAR_TONES[[...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TONES.length];

function StarRow({ value = 0, size = "h-3.5 w-3.5" }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <IconStar key={n} className={size + " " + (n <= Math.round(value) ? "text-amber-500" : "text-stone-200")} />
      ))}
    </div>
  );
}

const RDStyles = () => (
  <style>{`
    @keyframes rdRise {
      from { opacity: 0; transform: translateY(14px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes rdCardIn {
      from { opacity: 0; transform: translateY(24px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes rdShimmer {
      0% { background-position: -300px 0; }
      100% { background-position: calc(300px + 100%) 0; }
    }
    @keyframes rdBarIn {
      from { opacity: 0; transform: translateY(100%); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes rdQtyPop {
      0% { transform: scale(1); }
      40% { transform: scale(1.22); }
      100% { transform: scale(1); }
    }
    .rd-rise { animation: rdRise 0.5s cubic-bezier(0.16,1,0.3,1) backwards; }
    .rd-card-in { animation: rdCardIn 0.55s cubic-bezier(0.16,1,0.3,1) backwards; }
    .rd-bar-in { animation: rdBarIn 0.35s cubic-bezier(0.16,1,0.3,1); }
    .rd-qty-pop { animation: rdQtyPop 0.3s cubic-bezier(0.34,1.56,0.64,1); }
    .rd-shimmer {
      background: linear-gradient(90deg, #e7e5e4 25%, #f5f5f4 37%, #e7e5e4 63%);
      background-size: 300px 100%;
      animation: rdShimmer 1.4s ease-in-out infinite;
    }
    .rd-serif { font-family: Georgia, "Iowan Old Style", "Palatino Linotype", serif; }
  `}</style>
);

function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const { cart, addToCart } = useCart();
  const [addingId, setAddingId] = useState(null);
  const [cartError, setCartError] = useState("");
  const [poppedId, setPoppedId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [heroLoaded, setHeroLoaded] = useState(false);

  const categoryRefs = useRef({});
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restaurantRes, menuRes, reviewRes] = await Promise.all([
          axiosInstance.get(`/restaurants/${id}`),
          axiosInstance.get(`/menu-items/${id}`),
          axiosInstance.get(`/reviews/restaurant/${id}`),
        ]);
        setRestaurant(restaurantRes.data.data.restaurant);
        setMenuItems(menuRes.data.data.menuItems);
        setReviews(reviewRes.data.data.reviews);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load restaurant");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const groupedMenu = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const categories = useMemo(() => Object.keys(groupedMenu), [menuItems]);
  const openNow = isRestaurantOpenNow(restaurant);


  useEffect(() => {
    if (categories.length && !activeCategory) setActiveCategory(categories[0]);
  }, [categories, activeCategory]);

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    categoryRefs.current[cat]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAddToCart = async (menuItemId) => {
    setCartError("");
    setAddingId(menuItemId);
    setPoppedId(menuItemId);
    window.setTimeout(() => setPoppedId((cur) => (cur === menuItemId ? null : cur)), 300);
    try {
      await addToCart(menuItemId, 1);
    } catch (err) {
      setCartError(err.response?.data?.message || "Failed to add item");
    } finally {
      setAddingId(null);
    }
  };

  const cartItemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const cartTotal = cart?.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) || 0;
  const cartFromThisRestaurant = cart?.restaurant?._id === id || cart?.restaurant === id;

  // Rating breakdown for the reviews summary
  const ratingBreakdown = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]; // index 0 = 1 star ... index 4 = 5 star
    reviews.forEach((r) => {
      const v = Math.round(r.restaurantRating || 0);
      if (v >= 1 && v <= 5) counts[v - 1] += 1;
    });
    const max = Math.max(1, ...counts);
    return { counts, max };
  }, [reviews]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <RDStyles />
        <div className="w-full h-72 rd-shimmer sm:h-80" />
        <div className="max-w-3xl px-4 py-8 mx-auto sm:px-6">
          <div className="w-64 h-8 mb-2 rounded rd-shimmer" />
          <div className="w-full h-4 max-w-md mb-6 rounded rd-shimmer" />
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-full h-20 rounded-xl rd-shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-white">
        <RDStyles />
        <div className="text-center rd-rise">
          <p className="text-[14px] font-medium text-red-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-3 text-[13px] font-medium text-stone-500 underline underline-offset-2 hover:text-stone-800"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-white">
      <RDStyles />

      {/* Hero */}
      <div className="relative w-full h-64 overflow-hidden bg-stone-900 sm:h-80">
        {restaurant.images?.[0] ? (
          <img
            src={getImageUrl(restaurant.images[0])}
            alt={restaurant.name}
            onLoad={() => setHeroLoaded(true)}
            className={
              "h-full w-full object-cover opacity-90 transition-[filter,transform] duration-700 " +
              (heroLoaded ? "blur-0 scale-100" : "blur-md scale-105")
            }
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-stone-950/40" />

        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="absolute flex items-center justify-center w-10 h-10 transition-colors rounded-full left-4 top-4 bg-white/90 text-stone-700 backdrop-blur-sm hover:bg-white sm:left-6 sm:top-6"
        >
          <IconArrowLeft className="h-4.5 w-4.5" />
        </button>

        <div className="absolute flex items-center gap-2 right-4 top-4 sm:right-6 sm:top-6">
          <FavoriteButton restaurantId={id} />
        <span className={`rounded-full px-3 py-1.5 text-[11.5px] font-medium backdrop-blur-sm ${
  openNow ? "bg-green-500/90 text-white" : "bg-stone-500/90 text-white"
}`}>
  {openNow ? "Open now" : "Closed"}
</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 rd-rise sm:px-6 sm:pb-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="rd-serif text-[32px] font-normal leading-tight text-white sm:text-[40px]">
              {restaurant.name}
            </h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-white/85">
              <span className="flex items-center gap-1.5">
                <IconStar className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-medium text-white">
                  {restaurant.rating?.avg?.toFixed(1) || "New"}
                </span>
                <span className="text-white/60">({restaurant.rating?.count || 0})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <IconClock className="h-3.5 w-3.5" />
                {restaurant.openingHours?.open} – {restaurant.openingHours?.close}
              </span>
              <span className="flex items-center gap-1.5">
                <IconMapPin className="h-3.5 w-3.5" />
                {restaurant.address?.city}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl px-4 mx-auto sm:px-6">
        {/* Info card overlapping the hero */}
        <div
          className="rd-card-in relative z-10 -mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] sm:p-6"
          style={{ animationDelay: "80ms" }}
        >
          {restaurant.description && (
            <p className="text-[13.5px] leading-relaxed text-stone-600">{restaurant.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {(restaurant.cuisineType || []).map((c) => (
              <span
                key={c}
                className="rounded-full bg-stone-50 px-3 py-1 text-[11.5px] font-medium text-stone-600"
              >
                {c}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[12.5px] text-stone-400">
            {restaurant.address?.street}, {restaurant.address?.city} — {restaurant.address?.pincode}
          </p>
        </div>

        {/* Sticky category nav */}
        {categories.length > 1 && (
          <div className="sticky top-[65px] z-20 -mx-4 mt-8 border-b border-stone-100 bg-white/95 px-4 backdrop-blur-sm sm:-mx-6 sm:px-6">
            <div className="flex gap-6 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => scrollToCategory(cat)}
                  className={`shrink-0 whitespace-nowrap border-b-2 py-3.5 text-[13px] font-medium transition-colors ${
                    activeCategory === cat
                      ? "border-amber-600 text-stone-900"
                      : "border-transparent text-stone-400 hover:text-stone-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="mt-6">
          <h2 className="rd-serif mb-1 text-[24px] text-stone-900">Menu</h2>

          {cartError && (
            <div className="rd-rise mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              {cartError}
            </div>
          )}

          {menuItems.length === 0 ? (
            <div className="flex flex-col items-center text-center py-14">
              <span className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-stone-50 text-stone-300">
                <IconBag className="w-5 h-5" />
              </span>
              <p className="text-[13.5px] font-medium text-stone-600">Menu isn't up yet</p>
              <p className="mt-0.5 text-[12.5px] text-stone-400">Check back soon — the kitchen is still setting the table.</p>
            </div>
          ) : (
            Object.entries(groupedMenu).map(([category, items]) => (
              <div
                key={category}
                ref={(el) => (categoryRefs.current[category] = el)}
                className="border-b scroll-mt-32 border-stone-100 py-7 last:border-none"
              >
                <h3 className="mb-4 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-stone-400">
                  {category}
                </h3>
                <div className="divide-y divide-stone-100">
                  {items.map((item, i) => {
                    const isAdding = addingId === item._id;
                    const isPopped = poppedId === item._id;
                    return (
                      <div
                        key={item._id}
                        className="flex items-start justify-between gap-4 py-4 rd-rise first:pt-0 last:pb-0"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border ${
                                item.isVeg ? "border-green-600" : "border-red-600"
                              }`}
                            >
                              <span
                                className={`block h-1.5 w-1.5 rounded-full ${
                                  item.isVeg ? "bg-green-600" : "bg-red-600"
                                }`}
                              />
                            </span>
                            <h4 className="truncate text-[14.5px] font-medium text-stone-900">
                              {item.name}
                            </h4>
                          </div>
                          <p
                            className={`mt-1 text-[13.5px] font-semibold tabular-nums text-stone-900 ${
                              isPopped ? "rd-qty-pop" : ""
                            }`}
                          >
                            ₹{currency(item.price)}
                          </p>
                          {item.description && (
                            <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-stone-500">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-center gap-2 shrink-0">
                          {item.image ? (
                            <div className="relative w-24 h-24 overflow-hidden rounded-xl bg-stone-100 sm:h-28 sm:w-28">
                              <img
                                src={getImageUrl(item.image)}
                                alt={item.name}
                                className="object-cover w-full h-full"
                              />
                              {user?.role === "customer" && (
                                <button
                                  onClick={() => handleAddToCart(item._id)}
                                  disabled={isAdding}
                                  aria-label={`Add ${item.name}`}
                                  className="absolute -bottom-2 left-1/2 flex h-8 items-center gap-1 -translate-x-1/2 rounded-full bg-white px-3 text-[11.5px] font-semibold text-amber-700 shadow-[0_2px_8px_rgba(0,0,0,0.15)] ring-1 ring-stone-200 transition-all duration-150 hover:bg-amber-50 active:scale-90 disabled:opacity-60"
                                >
                                  {isAdding ? "…" : (
                                    <>
                                      <IconPlus className="w-3 h-3" /> Add
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          ) : (
                            user?.role === "customer" && (
                              <button
                                onClick={() => handleAddToCart(item._id)}
                                disabled={isAdding}
                                className="flex h-9 items-center gap-1 rounded-full border border-stone-200 px-4 text-[12px] font-semibold text-amber-700 transition-all duration-150 hover:border-amber-300 hover:bg-amber-50 active:scale-95 disabled:opacity-60"
                              >
                                {isAdding ? "Adding…" : (
                                  <>
                                    <IconPlus className="w-3 h-3" /> Add
                                  </>
                                )}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reviews */}
        <div className="pt-8 mt-4 border-t border-stone-100">
          <h2 className="rd-serif mb-5 text-[24px] text-stone-900">
            Reviews {reviews.length > 0 && <span className="text-stone-300">· {reviews.length}</span>}
          </h2>

          {reviews.length === 0 ? (
            <div className="flex flex-col items-center text-center py-14">
              <span className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-stone-50 text-stone-300">
                <IconMessageOff className="w-5 h-5" />
              </span>
              <p className="text-[13.5px] font-medium text-stone-600">No reviews yet</p>
              <p className="mt-0.5 text-[12.5px] text-stone-400">Be the first to order and share how it went.</p>
            </div>
          ) : (
            <>
              {/* Rating summary */}
              <div className="flex flex-col gap-6 pb-6 mb-6 border-b border-stone-100 sm:flex-row sm:items-center">
                <div className="flex flex-col items-center shrink-0 sm:items-start">
                  <p className="rd-serif text-[40px] leading-none text-stone-900">
                    {restaurant.rating?.avg?.toFixed(1) || "—"}
                  </p>
                  <div className="mt-1.5">
                    <StarRow value={restaurant.rating?.avg || 0} size="h-4 w-4" />
                  </div>
                  <p className="mt-1.5 text-[12px] text-stone-400">{reviews.length} review{reviews.length === 1 ? "" : "s"}</p>
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingBreakdown.counts[star - 1];
                    const pct = Math.round((count / ratingBreakdown.max) * 100);
                    return (
                      <div key={star} className="flex items-center gap-2.5">
                        <span className="w-2.5 text-[11.5px] tabular-nums text-stone-400">{star}</span>
                        <IconStar className="w-3 h-3 shrink-0 text-stone-300" />
                        <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className="h-full transition-all duration-500 rounded-full bg-amber-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-4 text-right text-[11px] tabular-nums text-stone-400">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review list */}
              <div className="divide-y divide-stone-100">
                {reviews.map((r, i) => (
                  <div
                    key={r._id}
                    className="py-5 rd-rise first:pt-0 last:pb-0"
                    style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold " +
                          avatarTone(r.customer?.name)
                        }
                      >
                        {initials(r.customer?.name)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-[13.5px] font-medium text-stone-900">
                            {r.customer?.name || "Guest"}
                          </p>
                          <span className="shrink-0 text-[11.5px] text-stone-400">
                            {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <div className="mt-1">
                          <StarRow value={r.restaurantRating} />
                        </div>
                        {r.restaurantComment && (
                          <p className="mt-2 text-[13.5px] leading-relaxed text-stone-600">
                            {r.restaurantComment}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sticky cart bar */}
      {cartItemCount > 0 && cartFromThisRestaurant && (
        <div className="rd-bar-in fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 px-4 py-3.5 backdrop-blur-md sm:px-6">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center text-white rounded-full h-9 w-9 bg-stone-900">
                <IconBag className="w-4 h-4" />
              </span>
              <div className="leading-tight">
                <p className="text-[13px] font-semibold text-stone-900">
                  {cartItemCount} item{cartItemCount === 1 ? "" : "s"}
                </p>
                <p className="text-[12px] tabular-nums text-stone-500">₹{currency(cartTotal)}</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/cart")}
              className="rounded-full bg-stone-900 px-6 py-2.5 text-[13px] font-medium text-white shadow-sm transition-all duration-200 hover:bg-stone-800 active:scale-95"
            >
              View cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantDetail;