// src/pages/AdminRestaurants.jsx
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const FILTERS = ["all", "pending", "approved", "rejected", "blocked"];

function IconStore(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 9 5 3h14l2 6M3 9v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}
function IconMail(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.3" />
      <path d="m3 6 9 6.5L21 6" />
    </svg>
  );
}
function IconPin(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}
function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function IconX(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function IconBan(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m5.5 5.5 13 13" />
    </svg>
  );
}
function IconInbox(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12h4l2 3h4l2-3h4" />
      <path d="M5.5 6h13L21 12v6a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18v-6l2.5-6Z" />
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
function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

const STATUS_STYLES = {
  approved: { badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", hex: "#16a34a" },
  pending: { badge: "bg-amber-50 text-amber-700", dot: "bg-amber-500", hex: "#d97706" },
  rejected: { badge: "bg-rose-50 text-rose-700", dot: "bg-rose-500", hex: "#dc2626" },
  blocked: { badge: "bg-stone-100 text-stone-600", dot: "bg-stone-400", hex: "#a8a29e" },
};

const AnimStyles = () => (
  <style>{`
    @keyframes arFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes arShimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
    .ar-fade-up { animation: arFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) backwards; }
    .ar-shimmer {
      background: linear-gradient(90deg, #f5f5f4 25%, #fafaf9 37%, #f5f5f4 63%);
      background-size: 400px 100%;
      animation: arShimmer 1.4s ease-in-out infinite;
    }
  `}</style>
);

function RestaurantsSkeleton() {
  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6">
      <AnimStyles />
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 h-7 w-52 rounded ar-shimmer" />
        <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl border border-stone-200 ar-shimmer" />
          ))}
        </div>
        <div className="mb-6 h-56 rounded-2xl border border-stone-200 ar-shimmer" />
        <div className="mb-6 flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 rounded-full ar-shimmer" />
          ))}
        </div>
        <div className="space-y-3.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 rounded-2xl border border-stone-200 ar-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent, delay }) {
  return (
    <div
      className="ar-fade-up group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-16px_rgba(28,25,23,0.16)]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        className="absolute left-0 top-0 h-[3px] w-full origin-left scale-x-0 transition-transform duration-250 group-hover:scale-x-100"
        style={{ backgroundColor: accent }}
      />
      <div
        className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-250"
        style={{ backgroundColor: `${accent}14`, color: accent }}
      >
        {icon}
      </div>
      <p className="text-[22px] font-semibold tabular-nums leading-none tracking-tight text-stone-900">
        {value}
      </p>
      <p className="mt-2 text-[12.5px] font-medium text-stone-500">{label}</p>
    </div>
  );
}

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-[12.5px] font-semibold capitalize text-stone-900">{p.name}</p>
      <p className="text-[11.5px] text-stone-400">{p.value} restaurant{p.value === 1 ? "" : "s"}</p>
    </div>
  );
}

function RestaurantCard({ r, updatingId, onStatusChange, delay }) {
  const s = STATUS_STYLES[r.status] || STATUS_STYLES.blocked;
  const isUpdating = updatingId === r._id;

  return (
    <div
      className="ar-fade-up rounded-2xl border border-stone-200 bg-white p-5 transition-colors duration-200 hover:border-stone-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500">
            <IconStore className="h-4 w-4" />
          </span>
          <h2 className="text-[14.5px] font-semibold text-stone-900">{r.name}</h2>
        </div>
        <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${s.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
          {r.status}
        </span>
      </div>

      <div className="ml-11.5 space-y-1">
        <p className="flex items-center gap-1.5 text-[12.5px] text-stone-500">
          <IconMail className="h-3.5 w-3.5 shrink-0 text-stone-300" />
          {r.owner?.name} · {r.owner?.email}
        </p>
        <p className="flex items-center gap-1.5 text-[12.5px] text-stone-500">
          <IconPin className="h-3.5 w-3.5 shrink-0 text-stone-300" />
          {r.address?.street}, {r.address?.city}
        </p>
      </div>

      <div className="ml-11.5 mt-4 flex flex-wrap gap-2">
        {r.status !== "approved" && (
          <button
            onClick={() => onStatusChange(r._id, "approved")}
            disabled={isUpdating}
            className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-[12.5px] font-medium text-white transition-colors duration-150 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconCheck className="h-3.5 w-3.5" />
            Approve
          </button>
        )}
        {r.status !== "rejected" && (
          <button
            onClick={() => onStatusChange(r._id, "rejected")}
            disabled={isUpdating}
            className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1.5 text-[12.5px] font-medium text-rose-600 transition-colors duration-150 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconX className="h-3.5 w-3.5" />
            Reject
          </button>
        )}
        {r.status !== "blocked" && (
          <button
            onClick={() => onStatusChange(r._id, "blocked")}
            disabled={isUpdating}
            className="flex items-center gap-1.5 rounded-full border border-stone-200 px-3.5 py-1.5 text-[12.5px] font-medium text-stone-600 transition-colors duration-150 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconBan className="h-3.5 w-3.5" />
            Block
          </button>
        )}
      </div>
    </div>
  );
}

function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");

  const fetchRestaurants = async (status) => {
    setLoading(true);
    try {
      const query = status === "all" ? "" : `?status=${status}`;
      const res = await axiosInstance.get(`/admin/restaurants${query}`);
      setRestaurants(res.data.data.restaurants);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants(filter);
  }, [filter]);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    setError("");
    try {
      await axiosInstance.patch(`/admin/restaurants/${id}/status`, { status });
      fetchRestaurants(filter);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update restaurant");
    } finally {
      setUpdatingId(null);
    }
  };

  // Note: stat cards & chart reflect only the currently-fetched (filtered) list,
  // since /admin/restaurants is queried per-status. Switch filter to "all" for a full picture.
  const pendingCount = useMemo(() => restaurants.filter((r) => r.status === "pending").length, [restaurants]);
  const approvedCount = useMemo(() => restaurants.filter((r) => r.status === "approved").length, [restaurants]);
  const blockedCount = useMemo(() => restaurants.filter((r) => r.status === "blocked").length, [restaurants]);

  const statusCounts = useMemo(() => {
    const counts = {};
    restaurants.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return counts;
  }, [restaurants]);

  const pieData = useMemo(
    () => Object.entries(statusCounts).map(([status, count]) => ({ name: status, value: count })),
    [statusCounts]
  );

  const filteredRestaurants = useMemo(() => {
    if (!search.trim()) return restaurants;
    const q = search.trim().toLowerCase();
    return restaurants.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.owner?.name?.toLowerCase().includes(q) ||
        r.owner?.email?.toLowerCase().includes(q)
    );
  }, [restaurants, search]);

  if (loading) return <RestaurantsSkeleton />;

  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6">
      <AnimStyles />
      <div className="mx-auto max-w-3xl">
        <div className="ar-fade-up mb-7">
          <h1 className="text-[22px] font-semibold tracking-tight text-stone-900">Manage restaurants</h1>
          <p className="mt-1 text-[13.5px] text-stone-500">Review, approve, or block restaurant accounts.</p>
        </div>

        {error && (
          <div className="ar-fade-up mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          <StatCard
            icon={<IconStore className="h-4.5 w-4.5" />}
            label="Total restaurants"
            value={restaurants.length}
            accent="#78716c"
            delay={0}
          />
          <StatCard
            icon={<IconClock className="h-4.5 w-4.5" />}
            label="Pending"
            value={pendingCount}
            accent="#d97706"
            delay={40}
          />
          <StatCard
            icon={<IconCheck className="h-4.5 w-4.5" />}
            label="Approved"
            value={approvedCount}
            accent="#16a34a"
            delay={80}
          />
          <StatCard
            icon={<IconBan className="h-4.5 w-4.5" />}
            label="Blocked"
            value={blockedCount}
            accent="#a8a29e"
            delay={120}
          />
        </div>

        {/* Status breakdown chart */}
        {restaurants.length > 0 && (
          <div
            className="ar-fade-up mb-6 rounded-2xl border border-stone-200 bg-white p-6"
            style={{ animationDelay: "160ms" }}
          >
            <p className="mb-4 text-[13px] font-medium text-stone-600">Status distribution</p>
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="h-44 w-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={(STATUS_STYLES[entry.name] || STATUS_STYLES.blocked).hex}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2.5">
                {Object.entries(statusCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => {
                    const s = STATUS_STYLES[status] || STATUS_STYLES.blocked;
                    const pct = restaurants.length ? (count / restaurants.length) * 100 : 0;
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
                        <span className="w-20 shrink-0 text-[12.5px] capitalize text-stone-600">{status}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: s.hex }}
                          />
                        </div>
                        <span className="w-6 shrink-0 text-right text-[12px] tabular-nums text-stone-400">
                          {count}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Filters + search */}
        <div className="ar-fade-up mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" style={{ animationDelay: "200ms" }}>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors duration-150 ${
                  filter === f
                    ? "bg-stone-900 text-white"
                    : "border border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, owner, email…"
              className="w-full rounded-xl border border-stone-200 py-2 pl-9 pr-8 text-[12.5px] text-stone-900 transition-colors placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-stone-300 hover:text-stone-600"
              >
                <IconX className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="ar-fade-up rounded-2xl border border-stone-200 bg-white p-10 text-center" style={{ animationDelay: "240ms" }}>
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-stone-50">
              <IconInbox className="h-5 w-5 text-stone-400" />
            </div>
            <p className="text-[13.5px] text-stone-500">
              {search ? `No restaurants match "${search}".` : "No restaurants in this category."}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredRestaurants.map((r, i) => (
              <RestaurantCard
                key={r._id}
                r={r}
                updatingId={updatingId}
                onStatusChange={handleStatusChange}
                delay={240 + i * 40}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminRestaurants;