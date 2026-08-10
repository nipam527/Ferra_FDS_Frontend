// src/pages/AdminOrders.jsx
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const STATUS_LABELS = {
  placed: "Placed",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const STATUS_STYLES = {
  placed: { badge: "bg-amber-50 text-amber-700", dot: "bg-amber-500", hex: "#d97706" },
  accepted: { badge: "bg-blue-50 text-blue-700", dot: "bg-blue-500", hex: "#2563eb" },
  preparing: { badge: "bg-blue-50 text-blue-700", dot: "bg-blue-500", hex: "#2563eb" },
  ready: { badge: "bg-violet-50 text-violet-700", dot: "bg-violet-500", hex: "#7c3aed" },
  out_for_delivery: { badge: "bg-violet-50 text-violet-700", dot: "bg-violet-500", hex: "#7c3aed" },
  delivered: { badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", hex: "#16a34a" },
  rejected: { badge: "bg-rose-50 text-rose-700", dot: "bg-rose-500", hex: "#dc2626" },
  cancelled: { badge: "bg-rose-50 text-rose-700", dot: "bg-rose-500", hex: "#dc2626" },
};
const DEFAULT_STATUS_STYLE = { badge: "bg-stone-100 text-stone-600", dot: "bg-stone-400", hex: "#a8a29e" };

const STATUS_FILTERS = ["all", "placed", "accepted", "preparing", "ready", "out_for_delivery", "delivered", "rejected", "cancelled"];

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);

function IconOrders(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8h12l-1 12.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20.5L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
function IconRevenue(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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
function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
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
function IconX(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
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

const AnimStyles = () => (
  <style>{`
    @keyframes aoFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes aoShimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
    .ao-fade-up { animation: aoFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) backwards; }
    .ao-shimmer {
      background: linear-gradient(90deg, #f5f5f4 25%, #fafaf9 37%, #f5f5f4 63%);
      background-size: 400px 100%;
      animation: aoShimmer 1.4s ease-in-out infinite;
    }
  `}</style>
);

function OrdersSkeleton() {
  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6">
      <AnimStyles />
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 h-7 w-40 rounded ao-shimmer" />
        <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl border border-stone-200 ao-shimmer" />
          ))}
        </div>
        <div className="mb-6 h-64 rounded-2xl border border-stone-200 ao-shimmer" />
        <div className="h-96 rounded-2xl border border-stone-200 ao-shimmer" />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent, delay }) {
  return (
    <div
      className="ao-fade-up group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-16px_rgba(28,25,23,0.16)]"
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

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-[11px] text-stone-400">
        {new Date(label).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
      </p>
      <p className="text-[13px] font-semibold text-stone-900">₹{currency(payload[0].value)}</p>
      <p className="text-[11px] text-stone-400">{payload[0].payload.count} orders</p>
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosInstance.get("/admin/orders");
        setOrders(res.data.data.orders);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const totalRevenue = useMemo(() => orders.reduce((s, o) => s + (o.grandTotal || 0), 0), [orders]);
  const deliveredCount = useMemo(() => orders.filter((o) => o.orderStatus === "delivered").length, [orders]);
  const activeCount = useMemo(
    () => orders.filter((o) => !["delivered", "rejected", "cancelled"].includes(o.orderStatus)).length,
    [orders]
  );

  // 7-day revenue series, zero-filled
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayOrders = orders.filter((o) => o.createdAt?.slice(0, 10) === key);
      days.push({
        date: key,
        revenue: dayOrders.reduce((s, o) => s + (o.grandTotal || 0), 0),
        count: dayOrders.length,
      });
    }
    return days;
  }, [orders]);

  const statusCounts = useMemo(() => {
    const counts = {};
    orders.forEach((o) => {
      counts[o.orderStatus] = (counts[o.orderStatus] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (statusFilter !== "all") list = list.filter((o) => o.orderStatus === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o._id.toLowerCase().includes(q) ||
          o.customer?.name?.toLowerCase().includes(q) ||
          o.restaurant?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, statusFilter, search]);

  if (loading) return <OrdersSkeleton />;

  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6">
      <AnimStyles />
      <div className="mx-auto max-w-5xl">
        <div className="ao-fade-up mb-7">
          <h1 className="text-[22px] font-semibold tracking-tight text-stone-900">All orders</h1>
          <p className="mt-1 text-[13.5px] text-stone-500">Platform-wide order activity and revenue.</p>
        </div>

        {error && (
          <div className="ao-fade-up mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          <StatCard
            icon={<IconOrders className="h-4.5 w-4.5" />}
            label="Total orders"
            value={orders.length}
            accent="#d97706"
            delay={0}
          />
          <StatCard
            icon={<IconRevenue className="h-4.5 w-4.5" />}
            label="Total revenue"
            value={`₹${currency(totalRevenue)}`}
            accent="#16a34a"
            delay={40}
          />
          <StatCard
            icon={<IconClock className="h-4.5 w-4.5" />}
            label="In progress"
            value={activeCount}
            accent="#7c3aed"
            delay={80}
          />
          <StatCard
            icon={<IconCheck className="h-4.5 w-4.5" />}
            label="Delivered"
            value={deliveredCount}
            accent="#2563eb"
            delay={120}
          />
        </div>

        {/* Revenue chart */}
        <div
          className="ao-fade-up mb-6 rounded-2xl border border-stone-200 bg-white p-6"
          style={{ animationDelay: "160ms" }}
        >
          <p className="mb-4 text-[13px] font-medium text-stone-600">Revenue — last 7 days</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="ordersRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d97706" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ef" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => new Date(d).toLocaleDateString("en-IN", { weekday: "short" })}
                  tick={{ fontSize: 11.5, fill: "#a8a29e" }}
                  axisLine={{ stroke: "#e7e5e4" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11.5, fill: "#a8a29e" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v}`}
                  width={55}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={2} fill="url(#ordersRevenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status breakdown */}
        <div
          className="ao-fade-up mb-6 rounded-2xl border border-stone-200 bg-white p-6"
          style={{ animationDelay: "200ms" }}
        >
          <p className="mb-4 text-[13px] font-medium text-stone-600">Status breakdown</p>
          <div className="space-y-2.5">
            {Object.keys(statusCounts).length === 0 ? (
              <p className="text-[13px] text-stone-400">No orders yet.</p>
            ) : (
              Object.entries(statusCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => {
                  const s = STATUS_STYLES[status] || DEFAULT_STATUS_STYLE;
                  const pct = orders.length ? (count / orders.length) * 100 : 0;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
                      <span className="w-32 shrink-0 text-[12.5px] capitalize text-stone-600">
                        {STATUS_LABELS[status] || status.replace(/_/g, " ")}
                      </span>
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
                })
            )}
          </div>
        </div>

        {/* Filters + search */}
        <div className="ao-fade-up mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" style={{ animationDelay: "240ms" }}>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`rounded-full px-3 py-1.5 text-[12px] font-medium capitalize transition-colors duration-150 ${
                  statusFilter === f
                    ? "bg-stone-900 text-white"
                    : "border border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700"
                }`}
              >
                {f === "all" ? "All" : STATUS_LABELS[f] || f.replace(/_/g, " ")}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order, customer, restaurant…"
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

        {/* Orders table */}
        {filteredOrders.length === 0 ? (
          <div className="ao-fade-up rounded-2xl border border-stone-200 bg-white p-10 text-center" style={{ animationDelay: "280ms" }}>
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-stone-50">
              <IconInbox className="h-5 w-5 text-stone-400" />
            </div>
            <p className="text-[13.5px] text-stone-500">
              {search || statusFilter !== "all" ? "No orders match your filters." : "No orders yet."}
            </p>
          </div>
        ) : (
          <div
            className="ao-fade-up overflow-hidden rounded-2xl border border-stone-200 bg-white"
            style={{ animationDelay: "280ms" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-stone-100 text-[11.5px] uppercase tracking-wide text-stone-400">
                    <th className="whitespace-nowrap p-3.5 font-medium">Order</th>
                    <th className="whitespace-nowrap p-3.5 font-medium">Customer</th>
                    <th className="whitespace-nowrap p-3.5 font-medium">Restaurant</th>
                    <th className="whitespace-nowrap p-3.5 font-medium">Total</th>
                    <th className="whitespace-nowrap p-3.5 font-medium">Status</th>
                    <th className="whitespace-nowrap p-3.5 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => {
                    const s = STATUS_STYLES[o.orderStatus] || DEFAULT_STATUS_STYLE;
                    return (
                      <tr
                        key={o._id}
                        className="border-b border-stone-50 transition-colors duration-150 last:border-0 hover:bg-stone-50/60"
                      >
                        <td className="whitespace-nowrap p-3.5 font-mono text-[11.5px] text-stone-400">
                          #{o._id.slice(-6)}
                        </td>
                        <td className="whitespace-nowrap p-3.5 text-stone-700">{o.customer?.name || "—"}</td>
                        <td className="whitespace-nowrap p-3.5 text-stone-700">{o.restaurant?.name || "—"}</td>
                        <td className="whitespace-nowrap p-3.5 font-medium tabular-nums text-stone-900">
                          ₹{currency(o.grandTotal)}
                        </td>
                        <td className="whitespace-nowrap p-3.5">
                          <span className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${s.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                            {o.orderStatus.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="whitespace-nowrap p-3.5 text-[11.5px] text-stone-400">
                          {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;