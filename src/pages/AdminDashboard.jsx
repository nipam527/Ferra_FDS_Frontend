// // src/pages/AdminDashboard.jsx
// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import axiosInstance from "../api/axiosInstance";

// function AdminDashboard() {
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await axiosInstance.get("/admin/dashboard-stats");
//         setStats(res.data.data);
//       } catch (err) {
//         setError(err.response?.data?.message || "Failed to load stats");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchStats();
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-gray-500">Loading dashboard...</p>
//       </div>
//     );
//   }

//   const cards = [
//     { label: "Total Users", value: stats?.totalUsers, color: "bg-blue-50 text-blue-700" },
//     { label: "Total Restaurants", value: stats?.totalRestaurants, color: "bg-purple-50 text-purple-700" },
//     { label: "Pending Approvals", value: stats?.pendingRestaurants, color: "bg-yellow-50 text-yellow-700" },
//     { label: "Total Orders", value: stats?.totalOrders, color: "bg-green-50 text-green-700" },
//     { label: "Total Revenue", value: `₹${stats?.totalRevenue}`, color: "bg-orange-50 text-orange-700" },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-100 px-4 py-10">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-2xl font-bold text-orange-600 mb-6">Admin Dashboard</h1>

//         {error && (
//           <div className="bg-red-100 text-red-700 text-sm p-3 rounded-md mb-4">{error}</div>
//         )}

//         <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
//           {cards.map((c) => (
//             <div key={c.label} className={`rounded-xl p-5 ${c.color}`}>
//               <p className="text-2xl font-bold">{c.value ?? "-"}</p>
//               <p className="text-sm mt-1">{c.label}</p>
//             </div>
//           ))}
//         </div>

//         <div className="grid sm:grid-cols-3 gap-4">
//           <Link
//             to="/admin/restaurants"
//             className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition text-center font-medium text-gray-800"
//           >
//             //           </Link>
//           <Link
//             to="/admin/users"
//             className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition text-center font-medium text-gray-800"
//           >
//             Manage Users
//           </Link>
//           <Link
//             to="/admin/orders"
//             className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition text-center font-medium text-gray-800"
//           >
//             View All Orders
//           </Link>
//           <Link
//   to="/admin/coupons"
//   className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition text-center font-medium text-gray-800"
// >
//   Manage Coupons
// </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AdminDashboard;




// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

function IconUsers(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconStore(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 9 5 3h14l2 6M3 9v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18" />
      <path d="M9 21v-6h6v6" />
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
function IconChevron(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
function IconRestaurant(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 2v7c0 1.1.9 2 2 2h1v11M6 2v9M9 2v9M14 2c-1.5 1.5-2 3-2 5s1 3 2 4v11" />
    </svg>
  );
}
function IconUser(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}
function IconTicket(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" />
      <path d="M9 6v12" strokeDasharray="2 3" />
    </svg>
  );
}
function IconSparkle(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2 13.8 8.2 20 10 13.8 11.8 12 18 10.2 11.8 4 10 10.2 8.2 12 2Z" />
    </svg>
  );
}
function IconAlert(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a1.5 1.5 0 0 0 1.3 2.25h17.76a1.5 1.5 0 0 0 1.3-2.25L13.71 3.86a1.5 1.5 0 0 0-2.42 0Z" />
    </svg>
  );
}

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);

const AnimStyles = () => (
  <style>{`
    @keyframes adFadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes adShimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
    @keyframes adGlowPulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    @keyframes adFloatIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .ad-fade-up { animation: adFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) backwards; }
    .ad-float-in { animation: adFloatIn 0.5s cubic-bezier(0.16,1,0.3,1) backwards; }
    .ad-shimmer {
      background: linear-gradient(90deg, #f5f5f4 25%, #fafaf9 37%, #f5f5f4 63%);
      background-size: 400px 100%;
      animation: adShimmer 1.4s ease-in-out infinite;
    }
    .ad-glow { animation: adGlowPulse 2.4s ease-in-out infinite; }
    .ad-stat-card {
      position: relative;
      overflow: hidden;
      transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), border-color 0.25s ease, box-shadow 0.25s ease;
    }
    .ad-stat-card:hover {
      transform: translateY(-2px);
      border-color: #e7e5e4;
      box-shadow: 0 8px 24px -12px rgba(28,25,23,0.12);
    }
    .ad-hero {
      background:
        radial-gradient(600px 200px at 15% 0%, rgba(217,119,6,0.08), transparent 60%),
        radial-gradient(500px 200px at 90% 10%, rgba(124,58,237,0.06), transparent 60%);
    }
  `}</style>
);

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6">
      <AnimStyles />
      <div className="mx-auto max-w-5xl">
        <div className="mb-1 h-4 w-24 rounded ad-shimmer" />
        <div className="mb-8 h-8 w-64 rounded ad-shimmer" />
        <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl border border-stone-200 ad-shimmer" />
          ))}
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[72px] rounded-2xl border border-stone-200 ad-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}


const ACCENTS = {
  amber: {
    bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100",
    hoverBorder: "hover:border-amber-300",
    solidBg: "group-hover:bg-amber-500", solidText: "group-hover:text-white",
    chip: "bg-amber-500",
  },
  blue: {
    bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-100",
    hoverBorder: "hover:border-blue-300",
    solidBg: "group-hover:bg-blue-500", solidText: "group-hover:text-white",
    chip: "bg-blue-500",
  },
  violet: {
    bg: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-100",
    hoverBorder: "hover:border-violet-300",
    solidBg: "group-hover:bg-violet-500", solidText: "group-hover:text-white",
    chip: "bg-violet-500",
  },
  emerald: {
    bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100",
    hoverBorder: "hover:border-emerald-300",
    solidBg: "group-hover:bg-emerald-500", solidText: "group-hover:text-white",
    chip: "bg-emerald-500",
  },
  rose: {
    bg: "bg-rose-50", text: "text-rose-600", ring: "ring-rose-100",
    hoverBorder: "hover:border-rose-300",
    solidBg: "group-hover:bg-rose-500", solidText: "group-hover:text-white",
    chip: "bg-rose-500",
  },
};


function StatCard({ icon, label, value, accent = "amber", flag, delay }) {
  const a = ACCENTS[accent];
  return (
    <div
      className={`ad-fade-up group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 transition-all duration-250 hover:-translate-y-0.5 ${a.hoverBorder} hover:shadow-[0_14px_32px_-16px_rgba(28,25,23,0.16)]`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* top accent bar that grows in on hover */}
      <span
        className={`absolute left-0 top-0 h-[3px] w-full origin-left scale-x-0 ${a.chip} transition-transform duration-250 group-hover:scale-x-100`}
      />

      <div className="relative mb-4 flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.bg} ${a.text} ring-4 ${a.ring} transition-all duration-250 ${a.solidBg} ${a.solidText} group-hover:scale-105 group-hover:ring-0`}
        >
          {icon}
        </div>
        {flag && (
          <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10.5px] font-medium text-rose-600">
            <IconAlert className="h-3 w-3" />
            {flag}
          </span>
        )}
      </div>

      <p className="relative text-[26px] font-semibold tabular-nums leading-none tracking-tight text-stone-900">
        {value ?? "—"}
      </p>
      <p className="relative mt-2 text-[12.5px] font-medium text-stone-500">{label}</p>
    </div>
  );
}

function NavCard({ to, icon, label, sub, accent = "amber", count, delay }) {
  const a = ACCENTS[accent];
  return (
    <Link
      to={to}
      className={`ad-fade-up group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 transition-all duration-250 hover:-translate-y-0.5 ${a.hoverBorder} hover:shadow-[0_14px_32px_-16px_rgba(28,25,23,0.16)]`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* left accent bar that grows in on hover */}
      <span
        className={`absolute left-0 top-0 h-full w-[3px] scale-y-0 ${a.chip} transition-transform duration-250 group-hover:scale-y-100`}
      />

      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${a.bg} ${a.text} transition-all duration-250 ${a.solidBg} ${a.solidText} group-hover:scale-105`}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="block text-[14px] font-medium text-stone-900">{label}</span>
          {count != null && (
            <span className={`rounded-full ${a.bg} ${a.text} px-2 py-0.5 text-[10.5px] font-semibold tabular-nums`}>
              {count}
            </span>
          )}
        </span>
        {sub && <span className="mt-0.5 block truncate text-[12px] text-stone-400">{sub}</span>}
      </span>

      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-50 text-stone-300 transition-all duration-250 ${a.solidBg} group-hover:text-white`}
      >
        <IconChevron className="h-4 w-4 transition-transform duration-250 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}


function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/admin/dashboard-stats");
        setStats(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const pendingCount = stats?.pendingRestaurants ?? 0;

  const cards = [
    { label: "Total users", value: stats?.totalUsers, icon: <IconUsers className="h-5 w-5" />, accent: "blue" },
    { label: "Total restaurants", value: stats?.totalRestaurants, icon: <IconStore className="h-5 w-5" />, accent: "violet" },
    {
      label: "Pending approvals",
      value: pendingCount,
      icon: <IconClock className="h-5 w-5" />,
      accent: "rose",
      flag: pendingCount > 0 ? "needs review" : null,
    },
    { label: "Total orders", value: stats?.totalOrders, icon: <IconOrders className="h-5 w-5" />, accent: "emerald" },
    { label: "Total revenue", value: `₹${currency(stats?.totalRevenue)}`, icon: <IconRevenue className="h-5 w-5" />, accent: "amber" },
  ];

  const navItems = [
    { to: "/admin/restaurants", label: "Manage restaurants", sub: "Approvals & listings", icon: <IconRestaurant className="h-5 w-5" />, accent: "violet" },
    { to: "/admin/users", label: "Manage users", sub: "Accounts & roles", icon: <IconUser className="h-5 w-5" />, accent: "blue" },
    { to: "/admin/orders", label: "View all orders", sub: "Platform-wide activity", icon: <IconOrders className="h-5 w-5" />, accent: "emerald" },
    { to: "/admin/coupons", label: "Manage coupons", sub: "Discounts & promos", icon: <IconTicket className="h-5 w-5" />, accent: "amber" },
  ];

  return (
<div className="min-h-screen bg-white px-4 py-10 sm:px-6">      <AnimStyles />
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="ad-fade-up mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-amber-600">
              <IconSparkle className="h-3.5 w-3.5" />
              <span>Admin</span>
            </div>
            <h1 className="text-[26px] font-semibold tracking-tight text-stone-900">
              Dashboard overview
            </h1>
            <p className="mt-1 text-[13.5px] text-stone-500">
              Everything happening across the platform, at a glance.
            </p>
          </div>
          {pendingCount > 0 && (
            <Link
              to="/admin/restaurants"
              className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-2 text-[12.5px] font-medium text-rose-600 transition-colors hover:bg-rose-100"
            >
              <IconAlert className="h-3.5 w-3.5" />
              {pendingCount} pending approval{pendingCount === 1 ? "" : "s"}
            </Link>
          )}
        </div>

        {error && (
          <div className="ad-fade-up mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {/* Stat cards */}
       {/* Stat cards */}
        <div className="mb-9 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            icon={<IconRevenue className="h-5 w-5" />}
            label="Total revenue"
            value={`₹${currency(stats?.totalRevenue)}`}
            accent="amber"
            delay={0}
          />
          <StatCard
            icon={<IconOrders className="h-5 w-5" />}
            label="Total orders"
            value={stats?.totalOrders}
            accent="emerald"
            delay={50}
          />
          <StatCard
            icon={<IconUsers className="h-5 w-5" />}
            label="Total users"
            value={stats?.totalUsers}
            accent="blue"
            delay={100}
          />
          <StatCard
            icon={<IconStore className="h-5 w-5" />}
            label="Total restaurants"
            value={stats?.totalRestaurants}
            accent="violet"
            delay={150}
          />
          <StatCard
            icon={<IconClock className="h-5 w-5" />}
            label="Pending approvals"
            value={pendingCount}
            accent="rose"
            flag={pendingCount > 0 ? "needs review" : null}
            delay={200}
          />
        </div>

        {/* Divider with label */}
       {/* Divider with label */}
        <div
          className="ad-fade-up mb-4 flex items-center gap-3"
          style={{ animationDelay: "280ms" }}
        >
          <p className="text-[13px] font-medium text-stone-600">Manage platform</p>
          <div className="h-px flex-1 bg-gradient-to-r from-stone-200 to-transparent" />
        </div>

        {/* Nav cards */}
        <div className="grid gap-3.5 sm:grid-cols-2">
          <NavCard
            to="/admin/restaurants"
            icon={<IconRestaurant className="h-5 w-5" />}
            label="Manage restaurants"
            sub="Approvals & listings"
            accent="violet"
            count={stats?.totalRestaurants}
            delay={320}
          />
          <NavCard
            to="/admin/users"
            icon={<IconUser className="h-5 w-5" />}
            label="Manage users"
            sub="Accounts & roles"
            accent="blue"
            count={stats?.totalUsers}
            delay={370}
          />
          <NavCard
            to="/admin/orders"
            icon={<IconOrders className="h-5 w-5" />}
            label="View all orders"
            sub="Platform-wide activity"
            accent="emerald"
            count={stats?.totalOrders}
            delay={420}
          />
          <NavCard
            to="/admin/coupons"
            icon={<IconTicket className="h-5 w-5" />}
            label="Manage coupons"
            sub="Discounts & promos"
            accent="amber"
            delay={470}
          />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;