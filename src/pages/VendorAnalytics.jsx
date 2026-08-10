import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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

const STATUS_COLORS = {
  placed: "#d97706",
  accepted: "#2563eb",
  preparing: "#2563eb",
  ready: "#7c3aed",
  out_for_delivery: "#7c3aed",
  delivered: "#16a34a",
  rejected: "#dc2626",
  cancelled: "#dc2626",
};

function IconRevenue(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
function IconOrders(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8h12l-1 12.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20.5L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
function IconTrend(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 17 9 11l4 4 8-8M21 7v6h-6" />
    </svg>
  );
}
function IconArrowUp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}
function IconArrowDown(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}
function IconMinus(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);

const AnimStyles = () => (
  <style>{`
    @keyframes vaFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes vaShimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
    .va-fade-up { animation: vaFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) backwards; }
    .va-shimmer {
      background: linear-gradient(90deg, #f5f5f4 25%, #fafaf9 37%, #f5f5f4 63%);
      background-size: 400px 100%;
      animation: vaShimmer 1.4s ease-in-out infinite;
    }
  `}</style>
);

function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen px-4 py-10 bg-white sm:px-6">
      <AnimStyles />
      <div className="max-w-4xl mx-auto">
        <div className="w-56 mb-8 rounded h-7 va-shimmer" />
        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 border rounded-2xl border-stone-200 va-shimmer" />
          ))}
        </div>
        <div className="mb-6 border h-72 rounded-2xl border-stone-200 va-shimmer" />
        <div className="h-56 border rounded-2xl border-stone-200 va-shimmer" />
      </div>
    </div>
  );
}

// Small trailing sparkline for a stat card — reuses the same 7-day series the main
// charts already fetched, so this doesn't cost an extra request or invent fake data.
function Sparkline({ data, dataKey, color }) {
  const gradientId = `spark-${dataKey}-${color.replace("#", "")}`;
  return (
    <div className="w-full h-10">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.75}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Real day-over-day delta (today vs yesterday) computed from the same series used for
// the sparkline — not a fabricated percentage.
function DeltaBadge({ current, previous }) {
  if (previous === 0 && current === 0) {
    return (
      <span className="flex items-center gap-1 text-[11px] font-medium text-stone-400">
        <IconMinus className="h-2.5 w-2.5" />
        No change
      </span>
    );
  }
  if (previous === 0) {
    return (
      <span className="flex items-center gap-1 text-[11px] font-medium text-green-600">
        <IconArrowUp className="h-2.5 w-2.5" />
        New today
      </span>
    );
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) {
    return (
      <span className="flex items-center gap-1 text-[11px] font-medium text-stone-400">
        <IconMinus className="h-2.5 w-2.5" />
        0% vs yesterday
      </span>
    );
  }
  const isUp = pct > 0;
  return (
    <span className={`flex items-center gap-1 text-[11px] font-medium ${isUp ? "text-green-600" : "text-red-500"}`}>
      {isUp ? <IconArrowUp className="h-2.5 w-2.5" /> : <IconArrowDown className="h-2.5 w-2.5" />}
      {Math.abs(pct)}% vs yesterday
    </span>
  );
}

function StatCard({ icon, label, value, delta, sparkData, sparkKey, sparkColor, delay }) {
  return (
    <div
      className="flex flex-col p-5 bg-white border va-fade-up rounded-2xl border-stone-200"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-center mb-3 rounded-full h-9 w-9 bg-amber-50 text-amber-600">
        {icon}
      </div>
      <p className="text-[22px] font-semibold tabular-nums tracking-tight text-stone-900">{value}</p>
      <p className="mt-0.5 text-[12.5px] text-stone-500">{label}</p>
      {delta}
      {sparkData && (
        <div className="mt-2">
          <Sparkline data={sparkData} dataKey={sparkKey} color={sparkColor} />
        </div>
      )}
    </div>
  );
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 bg-white border rounded-lg shadow-sm border-stone-200">
      <p className="text-[11px] text-stone-400">
        {new Date(label).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
      </p>
      <p className="text-[13px] font-semibold text-stone-900">
        ₹{currency(payload[0].value)}
      </p>
    </div>
  );
}

function OrdersTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="px-3 py-2 bg-white border rounded-lg shadow-sm border-stone-200">
      <p className="text-[11px] text-stone-400">
        {new Date(label).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
      </p>
      <p className="text-[13px] font-semibold text-stone-900">
        {value} order{value === 1 ? "" : "s"}
      </p>
    </div>
  );
}

function VendorAnalytics() {
  const { restaurantId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredDay, setHoveredDay] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axiosInstance.get(`/analytics/restaurant/${restaurantId}`);
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Couldn't load analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [restaurantId]);

  if (loading) return <AnalyticsSkeleton />;

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-white">
        <p className="text-[13.5px] text-red-600">{error || "No data available"}</p>
      </div>
    );
  }

  // build a full 7-day series with zeros filled in for days with no orders,
  // so the charts don't show gaps or misleading compressed scales
  const chartData = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const found = data.weeklyRevenue.find((w) => w._id === key);
      days.push({ date: key, revenue: found?.revenue || 0, orders: found?.orders || 0 });
    }
    return days;
  })();

  const totalWeekRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const totalWeekOrders = chartData.reduce((sum, d) => sum + d.orders, 0);
  const totalStatusCount = data.statusBreakdown.reduce((sum, s) => sum + s.count, 0);
  const busiestDay = chartData.reduce(
    (best, d) => (d.orders > best.orders ? d : best),
    chartData[0]
  );

  // today vs yesterday, straight from the same 7-day series — real numbers, no invented deltas
  const todayRevenue = chartData[chartData.length - 1]?.revenue ?? 0;
  const yesterdayRevenue = chartData[chartData.length - 2]?.revenue ?? 0;
  const todayOrders = chartData[chartData.length - 1]?.orders ?? 0;
  const yesterdayOrders = chartData[chartData.length - 2]?.orders ?? 0;

  const sortedStatuses = [...data.statusBreakdown].sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen px-4 py-10 bg-white sm:px-6">
      <AnimStyles />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between va-fade-up mb-7">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-stone-900">
              Analytics
            </h1>
            <p className="mt-1 text-[13.5px] text-stone-500">
              Performance over the last 7 days
            </p>
          </div>
          <Link
            to="/vendor/dashboard"
            className="text-[13.5px] font-medium text-stone-500 transition-colors hover:text-stone-900"
          >
            ← Back
          </Link>
        </div>

        {/* Stat cards — each carries a real trailing sparkline + a real day-over-day delta */}
        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3">
          <StatCard
            icon={<IconRevenue className="h-4.5 w-4.5" />}
            label="Today's revenue"
            value={`₹${currency(data.today.revenue)}`}
            delta={<DeltaBadge current={todayRevenue} previous={yesterdayRevenue} />}
            sparkData={chartData}
            sparkKey="revenue"
            sparkColor="#d97706"
            delay={0}
          />
          <StatCard
            icon={<IconOrders className="h-4.5 w-4.5" />}
            label="Today's orders"
            value={data.today.orderCount}
            delta={<DeltaBadge current={todayOrders} previous={yesterdayOrders} />}
            sparkData={chartData}
            sparkKey="orders"
            sparkColor="#2563eb"
            delay={40}
          />
          <StatCard
            icon={<IconTrend className="h-4.5 w-4.5" />}
            label="7-day revenue"
            value={`₹${currency(totalWeekRevenue)}`}
            delta={<p className="mt-1 text-[11px] text-stone-400">{totalWeekOrders} paid orders</p>}
            sparkData={chartData}
            sparkKey="revenue"
            sparkColor="#d97706"
            delay={80}
          />
        </div>

        {/* Revenue chart */}
        <div
          className="p-6 mb-6 bg-white border va-fade-up rounded-2xl border-stone-200"
          style={{ animationDelay: "120ms" }}
        >
          <p className="mb-4 text-[13px] font-medium text-stone-600">Revenue trend</p>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
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
                <Tooltip content={<RevenueTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#d97706"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders volume chart */}
        <div
          className="p-6 mb-6 bg-white border va-fade-up rounded-2xl border-stone-200"
          style={{ animationDelay: "160ms" }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-medium text-stone-600">Orders volume</p>
            {totalWeekOrders > 0 && (
              <p className="text-[11.5px] text-stone-400">
                Busiest:{" "}
                <span className="font-medium text-stone-600">
                  {new Date(busiestDay.date).toLocaleDateString("en-IN", { weekday: "short" })}
                </span>
              </p>
            )}
          </div>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
                onMouseMove={(state) => setHoveredDay(state?.activeLabel ?? null)}
                onMouseLeave={() => setHoveredDay(null)}
              >
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
                  allowDecimals={false}
                  width={28}
                />
                <Tooltip content={<OrdersTooltip />} cursor={{ fill: "#fafaf9" }} />
                <Bar dataKey="orders" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {chartData.map((d) => (
                    <Cell
                      key={d.date}
                      fill={
                        d.date === busiestDay.date && busiestDay.orders > 0
                          ? "#d97706"
                          : hoveredDay === d.date
                          ? "#d97706"
                          : "#fde3b6"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Top items */}
          <div
            className="p-6 bg-white border va-fade-up rounded-2xl border-stone-200"
            style={{ animationDelay: "200ms" }}
          >
            <p className="mb-4 text-[13px] font-medium text-stone-600">Top selling items</p>
            {data.topItems.length === 0 ? (
              <p className="text-[13px] text-stone-400">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {data.topItems.map((item, idx) => {
                  const maxQty = data.topItems[0].totalQuantity;
                  const pct = (item.totalQuantity / maxQty) * 100;
                  return (
                    <div key={item._id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="truncate pr-2 text-[13px] text-stone-700">
                          <span className="mr-1.5 text-stone-300">{idx + 1}.</span>
                          {item._id}
                        </span>
                        <span className="shrink-0 text-[12px] tabular-nums text-stone-400">
                          {item.totalQuantity} sold
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-full transition-all duration-500 rounded-full bg-amber-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status breakdown — donut with a centered total, legend alongside listing
              count + share, using the same STATUS_COLORS already defined above so this
              stays visually consistent with every other status indicator in the app. */}
          <div
            className="p-6 bg-white border va-fade-up rounded-2xl border-stone-200"
            style={{ animationDelay: "240ms" }}
          >
            <p className="mb-1 text-[13px] font-medium text-stone-600">Order status breakdown</p>
            <p className="mb-4 text-[11.5px] text-stone-400">Overview of all orders</p>

            {data.statusBreakdown.length === 0 ? (
              <p className="text-[13px] text-stone-400">No orders yet.</p>
            ) : (
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-40 h-40 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sortedStatuses}
                        dataKey="count"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={72}
                        paddingAngle={totalStatusCount > 1 ? 3 : 0}
                        stroke="none"
                      >
                        {sortedStatuses.map((s) => (
                          <Cell key={s._id} fill={STATUS_COLORS[s._id] || "#a8a29e"} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[11px] text-stone-400">Total</p>
                    <p className="text-[22px] font-semibold tabular-nums text-stone-900">{totalStatusCount}</p>
                    <p className="text-[10.5px] text-stone-400">orders</p>
                  </div>
                </div>

                <div className="w-full space-y-2.5 sm:w-auto">
                  {sortedStatuses.map((s) => {
                    const pct = totalStatusCount ? Math.round((s.count / totalStatusCount) * 100) : 0;
                    return (
                      <div key={s._id} className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: STATUS_COLORS[s._id] || "#a8a29e" }}
                        />
                        <span className="min-w-[6.5rem] text-[12.5px] text-stone-600">
                          {STATUS_LABELS[s._id] || s._id}
                        </span>
                        <span className="text-[12px] tabular-nums text-stone-400">
                          {s.count} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorAnalytics;                                 