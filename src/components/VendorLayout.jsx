// src/components/VendorLayout.jsx
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

function IconGrid(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconStore(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 9 4.5 4h15L21 9M3 9v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18M9 20v-6h6v6" />
    </svg>
  );
}
function IconChart(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 3v18h18M7 15l4-4 3 3 5-6" />
    </svg>
  );
}
function IconLogout(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function IconCrown(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m2 8 4 3 6-7 6 7 4-3-2 11H4Z" />
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

const NAV_ITEMS = [
  { to: "/vendor/dashboard", label: "Dashboard", icon: IconGrid },
  { to: "/vendor/restaurants", label: "Restaurants", icon: IconStore },
  { to: "/vendor/analytics", label: "Analytics", icon: IconChart },
];

function VendorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = (user?.name || "V").trim().charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex-col hidden w-64 bg-white border-r border-stone-200 lg:flex">
        <Link to="/vendor/dashboard" className="flex items-center gap-2.5 px-6 py-5">
          <span className="flex items-center justify-center h-9 w-9 rounded-xl bg-stone-900 text-amber-400">
            <IconStore className="h-4.5 w-4.5" />
          </span>
          <span className="leading-tight">
            <span className="block text-[16px] font-semibold text-stone-900">Farro.</span>
            <span className="block text-[10px] font-medium uppercase tracking-wider text-stone-400">
              Restaurant admin
            </span>
          </span>
        </Link>

        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/vendor/dashboard"}
                className={({ isActive }) =>
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-colors " +
                  (isActive
                    ? "bg-amber-50 text-amber-700"
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-800")
                }
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50">
            <span className="flex items-center justify-center rounded-full h-9 w-9 bg-amber-100 text-amber-600">
              <IconCrown className="h-4.5 w-4.5" />
            </span>
            <p className="mt-3 text-[13.5px] font-semibold text-stone-900">Go Premium</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-stone-500">
              Unlock advanced features and grow your business.
            </p>
            <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-stone-900 py-2 text-[12px] font-medium text-white hover:bg-stone-800">
              Upgrade now <IconArrowRight className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-stone-500 hover:bg-stone-50 hover:text-red-600"
          >
            <IconLogout className="h-4.5 w-4.5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-stone-200 bg-white/90 px-4 py-3.5 backdrop-blur-sm sm:px-8">
          <div className="relative flex-1 hidden max-w-md sm:block">
            <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search for anything..."
              className="w-full rounded-full border border-stone-200 bg-stone-50 py-2 pl-10 pr-4 text-[13px] text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            <NotificationBell />
            <div className="flex items-center gap-2 py-1 pl-1 pr-3 border rounded-full border-stone-200">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-[11px] font-semibold text-white">
                {initials}
              </span>
              <span className="text-[13px] font-medium text-stone-800">{user?.name || "Vendor"}</span>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default VendorLayout;