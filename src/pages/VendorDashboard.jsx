// src/pages/VendorDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { getImageUrl } from "../utils/getImageUrl";

function IconStore(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 9 4.5 4h15L21 9M3 9v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18M9 20v-6h6v6" />
    </svg>
  );
}
function IconClock(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}
function IconPlus(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconMenu(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}
function IconBag(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8h12l-1 12.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20.5L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
function IconChart(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 3v18h18M7 15l4-4 3 3 5-6" />
    </svg>
  );
}
function IconWallet(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-4M20 7a2 2 0 0 0-2-2H6M20 7v4h-3.5a2 2 0 0 1 0-4H20" />
    </svg>
  );
}

const STATUS_STYLES = {
  pending: { text: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" },
  approved: { text: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
  rejected: { text: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
  blocked: { text: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
};

const AnimStyles = () => (
  <style>{`
    @keyframes vdFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes vdShimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
    .vd-fade-up { animation: vdFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) backwards; }
    .vd-shimmer {
      background: linear-gradient(90deg, #f5f5f4 25%, #fafaf9 37%, #f5f5f4 63%);
      background-size: 400px 100%;
      animation: vdShimmer 1.4s ease-in-out infinite;
    }
  `}</style>
);

function DashboardSkeleton() {
  return (
    <div className="min-h-screen px-4 py-10 bg-white sm:px-6">
      <AnimStyles />
      <div className="max-w-4xl mx-auto">
        <div className="w-48 mb-8 rounded h-7 vd-shimmer" />
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 border rounded-2xl border-stone-200 vd-shimmer" />
          ))}
        </div>
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-40 border rounded-2xl border-stone-200 vd-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}

function VendorDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyRestaurants = async () => {
      try {
        const res = await axiosInstance.get("/restaurants/mine");
        setRestaurants(res.data.data.restaurants);
      } catch (err) {
        setError(err.response?.data?.message || "Couldn't load your restaurants.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyRestaurants();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const approvedCount = restaurants.filter((r) => r.status === "approved").length;
  const pendingCount = restaurants.filter((r) => r.status === "pending").length;

  return (
    <div className="min-h-screen px-4 py-10 bg-white sm:px-6">
      <AnimStyles />
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 vd-fade-up mb-7">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-stone-900">
              My Restaurants
            </h1>
            <p className="mt-1 text-[13.5px] text-stone-500">
              {restaurants.length > 0
                ? `Manage ${restaurants.length} restaurant${restaurants.length === 1 ? "" : "s"}`
                : "Set up your first restaurant to get started"}
            </p>
          </div>
          {restaurants.length > 0 && (
            <Link
              to="/vendor/create-restaurant"
              className="flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-stone-800"
            >
              <IconPlus className="h-3.5 w-3.5" />
              New Restaurant
            </Link>
          )}
        </div>

        {error && (
          <div className="vd-fade-up mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {restaurants.length === 0 ? (
          <div className="p-8 text-center border vd-fade-up rounded-2xl border-stone-200" style={{ animationDelay: "60ms" }}>
            <div className="flex items-center justify-center mx-auto mb-4 rounded-full h-14 w-14 bg-stone-50">
              <IconStore className="w-6 h-6 text-stone-400" />
            </div>
            <h2 className="text-[15px] font-semibold text-stone-900">No restaurants yet</h2>
            <p className="mt-1.5 text-[13.5px] text-stone-500">
              Create your first restaurant to start receiving orders.
            </p>
            <Link
              to="/vendor/create-restaurant"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-stone-900 px-5 py-2.5 text-[13.5px] font-medium text-white transition-all hover:bg-stone-800 hover:scale-[1.03] active:scale-[0.97]"
            >
              Create Restaurant
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6 vd-fade-up" style={{ animationDelay: "40ms" }}>
              <div className="p-4 border rounded-2xl border-stone-200">
                <p className="text-[20px] font-semibold tabular-nums text-stone-900">
                  {restaurants.length}
                </p>
                <p className="mt-0.5 text-[12px] text-stone-500">Total restaurants</p>
              </div>
              <div className="p-4 border rounded-2xl border-stone-200">
                <p className="text-[20px] font-semibold tabular-nums text-green-700">
                  {approvedCount}
                </p>
                <p className="mt-0.5 text-[12px] text-stone-500">Approved</p>
              </div>
              <div className="p-4 border rounded-2xl border-stone-200">
                <p className="text-[20px] font-semibold tabular-nums text-amber-700">
                  {pendingCount}
                </p>
                <p className="mt-0.5 text-[12px] text-stone-500">Pending review</p>
              </div>
            </div>

            <div className="space-y-4">
              {restaurants.map((r, idx) => {
                const style = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
                return (
                  <div
                    key={r._id}
                    className="overflow-hidden transition-shadow border vd-fade-up rounded-2xl border-stone-200 hover:shadow-sm sm:flex"
                    style={{ animationDelay: `${80 + idx * 50}ms` }}
                  >
                    <div className="w-full h-40 shrink-0 bg-stone-50 sm:h-auto sm:w-48">
                      {r.images?.[0] ? (
                        <img
                          src={getImageUrl(r.images[0])}
                          alt={r.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-stone-300">
                          <IconStore className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                        <div>
                          <h2 className="text-[15px] font-semibold text-stone-900">{r.name}</h2>
                          <p className="text-[12.5px] text-stone-500">
                            {r.cuisineType?.join(", ") || "Various cuisines"} · {r.address?.city}
                          </p>
                        </div>
                        <span
                          className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${style.bg} ${style.text}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {r.status}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-3 text-[12px] text-stone-400">
                        <span className="flex items-center gap-1">
                          <IconClock className="w-3 h-3" />
                          {r.openingHours?.open} – {r.openingHours?.close}
                        </span>
                        <span className={`flex items-center gap-1 ${r.isOpen ? "text-green-600" : "text-stone-400"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${r.isOpen ? "bg-green-500" : "bg-stone-300"}`} />
                          {r.isOpen ? "Open now" : "Closed"}
                        </span>
                        {r.rating?.count > 0 && (
                          <span>★ {r.rating.avg.toFixed(1)} ({r.rating.count})</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <Link
                          to={`/vendor/restaurants/${r._id}/menu`}
                          className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-2 text-[12.5px] font-medium text-amber-700 transition-colors hover:bg-amber-100"
                        >
                          <IconMenu className="h-3.5 w-3.5" />
                          Manage Menu
                        </Link>

                        <Link
                          to={`/vendor/restaurants/${r._id}/earnings`}
                          className="flex items-center gap-1.5 rounded-full bg-green-50 px-3.5 py-2 text-[12.5px] font-medium text-green-700 transition-colors hover:bg-green-100"
                        >
                          <IconWallet className="h-3.5 w-3.5" />
                          Earnings
                        </Link>

                        <Link
                          to={`/vendor/restaurants/${r._id}/orders`}
                          className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3.5 py-2 text-[12.5px] font-medium text-stone-700 transition-colors hover:bg-stone-200"
                        >
                          <IconBag className="h-3.5 w-3.5" />
                          Orders
                        </Link>
                        <Link
                          to={`/vendor/restaurants/${r._id}/analytics`}
                          className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3.5 py-2 text-[12.5px] font-medium text-stone-700 transition-colors hover:bg-stone-200"
                        >
                          <IconChart className="h-3.5 w-3.5" />
                          Analytics
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default VendorDashboard;