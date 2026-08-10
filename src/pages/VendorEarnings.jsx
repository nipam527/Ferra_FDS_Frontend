// src/pages/VendorEarnings.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAlert } from "../context/AlertContext";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const STATUS_STYLE = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  processing: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  paid: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  failed: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

function IconWallet(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-4M20 7a2 2 0 0 0-2-2H6M20 7v4h-3.5a2 2 0 0 1 0-4H20" />
    </svg>
  );
}
function IconPercent(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 5 5 19M7.5 5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM16.5 14a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
    </svg>
  );
}
function IconCheckCircle(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.2 2.2 4.8-5" />
    </svg>
  );
}
function IconArrowRight(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function IconInbox(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12h4l2 3h4l2-3h4" />
      <path d="M5.5 5h13l2.2 7v7a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-7l2.2-7Z" />
    </svg>
  );
}

const currency = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);

const AnimStyles = () => (
  <style>{`
    @keyframes veFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes veShimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
    .ve-fade-up { animation: veFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) backwards; }
    .ve-shimmer {
      background: linear-gradient(90deg, #f5f5f4 25%, #fafaf9 37%, #f5f5f4 63%);
      background-size: 400px 100%;
      animation: veShimmer 1.4s ease-in-out infinite;
    }
  `}</style>
);

function EarningsSkeleton() {
  return (
    <div className="min-h-screen px-4 py-10 bg-white sm:px-6">
      <AnimStyles />
      <div className="max-w-4xl mx-auto">
        <div className="w-40 mb-2 rounded h-7 ve-shimmer" />
        <div className="w-64 h-4 mb-6 rounded ve-shimmer" />
        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border rounded-2xl border-stone-200 ve-shimmer h-36" />
          ))}
        </div>
        <div className="mb-6 border h-28 rounded-2xl border-stone-200 ve-shimmer" />
        <div className="border h-72 rounded-2xl border-stone-200 ve-shimmer" />
      </div>
    </div>
  );
}

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  const style = STATUS_STYLE[point?.status] || STATUS_STYLE.pending;
  return (
    <div className="px-3 py-2 bg-white border rounded-lg shadow-sm border-stone-200">
      <p className="text-[11px] text-stone-400">{label}</p>
      <p className="text-[13px] font-semibold text-stone-900">₹{currency(point?.amount)}</p>
      <p className={`mt-0.5 flex items-center gap-1 text-[11px] font-medium ${style.text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
        {point?.status}
      </p>
    </div>
  );
}

// Small trailing sparkline for a stat card, mirroring the pattern used on the
// analytics page — reuses chart-ready data, no extra request.
function Sparkline({ data, dataKey, color }) {
  const gradientId = `ve-spark-${dataKey}-${color.replace("#", "")}`;
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

function StatCard({ icon, label, value, sub, sparkData, sparkKey, sparkColor, delay }) {
  return (
    <div
      className="group relative flex flex-col overflow-hidden p-5 bg-white border ve-fade-up rounded-2xl border-stone-200 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_12px_28px_-12px_rgba(217,119,6,0.25)]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="absolute w-24 h-24 transition-all duration-500 rounded-full pointer-events-none -right-6 -top-6 bg-amber-100/0 blur-2xl group-hover:bg-amber-100/70"
      />
      <div className="relative z-10 flex items-center justify-center mb-3 transition-transform duration-300 ease-out rounded-full h-9 w-9 bg-amber-50 text-amber-600 group-hover:scale-110 group-hover:bg-amber-100">
        {icon}
      </div>
      <p className="relative z-10 text-[22px] font-semibold tabular-nums tracking-tight text-stone-900 transition-transform duration-300 group-hover:translate-x-0.5">
        {value}
      </p>
      <p className="relative z-10 mt-0.5 text-[12.5px] text-stone-500">{label}</p>
      {sub && <p className="relative z-10 mt-1 text-[11px] text-stone-400">{sub}</p>}
      {sparkData && (
        <div className="relative z-10 mt-2 transition-opacity duration-300 opacity-80 group-hover:opacity-100">
          <Sparkline data={sparkData} dataKey={sparkKey} color={sparkColor} />
        </div>
      )}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-amber-400 to-amber-300 transition-transform duration-300 ease-out group-hover:scale-x-100" />
    </div>
  );
}

function VendorEarnings() {
  const { restaurantId } = useParams();
  const { toast } = useAlert();
  const [summary, setSummary] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(false);

  const fetchData = async () => {
    try {
      const [summaryRes, payoutsRes] = await Promise.all([
        axiosInstance.get(`/payouts/restaurant/${restaurantId}/summary`),
        axiosInstance.get(`/payouts/restaurant/${restaurantId}`),
      ]);
      setSummary(summaryRes.data.data);
      setPayouts(payoutsRes.data.data.payouts);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load earnings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const handleRequestPayout = async () => {
    setRequesting(true);
    try {
      await axiosInstance.post(`/payouts/restaurant/${restaurantId}/request`);
      toast.success("Payout requested", "It will be processed by the admin team");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request payout");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <EarningsSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-white">
        <p className="text-[13.5px] text-red-600">{error}</p>
      </div>
    );
  }

  const canRequestPayout = summary.availableBalance >= 100;

  // Oldest -> newest, capped to the most recent 8 payouts so the trend line
  // stays readable. Cumulative paid total is tracked for the stat sparkline.
  const chartPayouts = [...payouts]
    .sort((a, b) => new Date(a.periodStart) - new Date(b.periodStart))
    .slice(-8);

  let running = 0;
  const chartData = chartPayouts.map((p) => {
    if (p.status === "paid") running += p.amount;
    return {
      label: new Date(p.periodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      amount: p.amount,
      status: p.status,
      cumulative: running,
    };
  });

  const latestPayout = payouts.length
    ? [...payouts].sort((a, b) => new Date(b.periodEnd) - new Date(a.periodEnd))[0]
    : null;
  const paidPayouts = payouts.filter((p) => p.status === "paid").length;

  return (
    <div className="min-h-screen px-4 py-10 bg-white sm:px-6">
      <AnimStyles />
      <div className="max-w-4xl mx-auto">
      <div className="mb-6 ve-fade-up">
        <h1 className="text-[22px] font-semibold tracking-tight text-stone-900">Earnings</h1>
        <p className="mt-1 text-[13.5px] text-stone-500">Track your revenue and manage payouts</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3">
        <StatCard
          icon={<IconWallet className="h-4.5 w-4.5" />}
          label="Available balance"
          value={`₹${currency(summary.availableBalance)}`}
          sub={`${summary.pendingOrderCount} order${summary.pendingOrderCount === 1 ? "" : "s"} since last payout`}
          sparkData={chartData.length ? chartData : null}
          sparkKey="amount"
          sparkColor="#d97706"
          delay={0}
        />
        <StatCard
          icon={<IconPercent className="h-4.5 w-4.5" />}
          label="Platform commission"
          value={`${summary.commissionPercent}%`}
          sub="Applied to food revenue"
          delay={40}
        />
        <StatCard
          icon={<IconCheckCircle className="h-4.5 w-4.5" />}
          label="Lifetime paid out"
          value={`₹${currency(summary.lifetimePaidOut)}`}
          sub={`${paidPayouts} payout${paidPayouts === 1 ? "" : "s"} completed`}
          sparkData={chartData.length ? chartData : null}
          sparkKey="cumulative"
          sparkColor="#16a34a"
          delay={80}
        />
      </div>

      {/* Request payout card */}
      <div
        className="flex flex-col items-start justify-between gap-4 p-6 mb-6 border ve-fade-up rounded-2xl border-stone-200 bg-gradient-to-br from-amber-50/60 to-white sm:flex-row sm:items-center"
        style={{ animationDelay: "120ms" }}
      >
        <div>
          <p className="text-[14.5px] font-semibold text-stone-900">Request a payout</p>
          <p className="mt-1 text-[12.5px] text-stone-500">
            {canRequestPayout
              ? `You have ₹${currency(summary.availableBalance)} available to withdraw`
              : "Minimum ₹100 balance required to request a payout"}
          </p>
        </div>
        <button
          onClick={handleRequestPayout}
          disabled={!canRequestPayout || requesting}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-stone-900 px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
        >
          {requesting ? "Requesting..." : "Request payout"}
          {!requesting && <IconArrowRight className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Payout trend */}
      <div
        className="p-6 mb-6 bg-white border ve-fade-up rounded-2xl border-stone-200"
        style={{ animationDelay: "160ms" }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-medium text-stone-600">Payout trend</p>
          {latestPayout && (
            <p className="text-[11.5px] text-stone-400">
              Last:{" "}
              <span className="font-medium text-stone-600">
                {new Date(latestPayout.periodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            </p>
          )}
        </div>

        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-stone-50">
              <IconInbox className="w-5 h-5 text-stone-300" />
            </span>
            <p className="text-[13px] text-stone-500">Payouts will appear here once processed</p>
          </div>
        ) : (
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="payoutGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d97706" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ef" vertical={false} />
                <XAxis
                  dataKey="label"
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
                  allowDecimals={false}
                />
                <Tooltip content={<TrendTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#d97706"
                  strokeWidth={2}
                  fill="url(#payoutGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Payout history */}
      <div>
        <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-stone-400">
          Payout history
        </p>

        {payouts.length === 0 ? (
          <div className="p-10 text-center bg-white border rounded-2xl border-stone-200">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-stone-50">
              <IconWallet className="w-5 h-5 text-stone-300" />
            </div>
            <p className="text-[13.5px] text-stone-500">No payouts yet</p>
          </div>
        ) : (
          <div className="overflow-hidden bg-white border rounded-2xl border-stone-200">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left border-b border-stone-100 text-stone-500">
                    <th className="px-5 py-3 font-medium">Period</th>
                    <th className="px-5 py-3 font-medium">Orders</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => {
                    const style = STATUS_STYLE[p.status] || STATUS_STYLE.pending;
                    return (
                      <tr key={p._id} className="border-b border-stone-50 last:border-0">
                        <td className="px-5 py-3.5 whitespace-nowrap text-stone-600">
                          {new Date(p.periodStart).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          {" – "}
                          {new Date(p.periodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </td>
                        <td className="px-5 py-3.5 text-stone-600">{p.orderCount}</td>
                        <td className="px-5 py-3.5 font-semibold tabular-nums text-stone-900">
                          ₹{currency(p.amount)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={"flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium " + style.bg + " " + style.text}>
                            <span className={"h-1.5 w-1.5 rounded-full " + style.dot} />
                            {p.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[11.5px] text-stone-400">
                          {p.payoutReference || "—"}
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
    </div>
  );
}

export default VendorEarnings;