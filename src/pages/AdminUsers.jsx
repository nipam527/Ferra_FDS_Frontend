// src/pages/AdminUsers.jsx
import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../api/axiosInstance";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const ROLE_FILTERS = ["all", "customer", "vendor", "rider"];

function IconMail(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.3" />
      <path d="m3 6 9 6.5L21 6" />
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
function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
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
function IconBike(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M12 17.5V14l-3-3 4-3 2 3h3" />
    </svg>
  );
}

const ROLE_STYLES = {
  customer: { badge: "bg-blue-50 text-blue-600", avatar: "from-blue-500 to-blue-600", hex: "#2563eb" },
  vendor: { badge: "bg-violet-50 text-violet-600", avatar: "from-violet-500 to-violet-600", hex: "#7c3aed" },
  rider: { badge: "bg-emerald-50 text-emerald-600", avatar: "from-emerald-500 to-emerald-600", hex: "#16a34a" },
};
const DEFAULT_ROLE_STYLE = { badge: "bg-stone-100 text-stone-500", avatar: "from-stone-400 to-stone-500", hex: "#a8a29e" };

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

const AnimStyles = () => (
  <style>{`
    @keyframes auFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes auShimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
    .au-fade-up { animation: auFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) backwards; }
    .au-shimmer {
      background: linear-gradient(90deg, #f5f5f4 25%, #fafaf9 37%, #f5f5f4 63%);
      background-size: 400px 100%;
      animation: auShimmer 1.4s ease-in-out infinite;
    }
  `}</style>
);

function UsersSkeleton() {
  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6">
      <AnimStyles />
      <div className="mx-auto max-w-3xl">
        <div className="mb-1 h-4 w-20 rounded au-shimmer" />
        <div className="mb-6 h-7 w-44 rounded au-shimmer" />
        <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl border border-stone-200 au-shimmer" />
          ))}
        </div>
        <div className="mb-6 h-56 rounded-2xl border border-stone-200 au-shimmer" />
        <div className="mb-4 h-10 w-full rounded-xl au-shimmer" />
        <div className="mb-6 flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-20 rounded-full au-shimmer" />
          ))}
        </div>
        <div className="overflow-hidden rounded-2xl border border-stone-200">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[68px] border-b border-stone-100 last:border-0 au-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent, delay }) {
  return (
    <div
      className="au-fade-up group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-16px_rgba(28,25,23,0.16)]"
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
      <p className="text-[11.5px] text-stone-400">{p.value} user{p.value === 1 ? "" : "s"}</p>
    </div>
  );
}

function UserRow({ u, updatingId, onToggleBlock, delay }) {
  const isUpdating = updatingId === u._id;
  const roleStyle = ROLE_STYLES[u.role] || DEFAULT_ROLE_STYLE;

  return (
    <div
      className="au-fade-up group flex items-center gap-3.5 p-4 transition-colors duration-150 hover:bg-stone-50/70"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[12px] font-semibold text-white ${roleStyle.avatar}`}
      >
        {initials(u.name)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-[13.5px] font-medium text-stone-900">{u.name}</p>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-medium capitalize ${roleStyle.badge}`}>
            {u.role}
          </span>
          {u.isBlocked && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10.5px] font-medium text-rose-600">
              <IconBan className="h-2.5 w-2.5" />
              blocked
            </span>
          )}
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-stone-400">
          <IconMail className="h-3 w-3 shrink-0" />
          {u.email}
        </p>
      </div>

      <button
        onClick={() => onToggleBlock(u._id)}
        disabled={isUpdating}
        className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
          u.isBlocked
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "bg-rose-50 text-rose-600 hover:bg-rose-100"
        }`}
      >
        {isUpdating ? (
          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : u.isBlocked ? (
          <>
            <IconCheck className="h-3.5 w-3.5" />
            Unblock
          </>
        ) : (
          <>
            <IconBan className="h-3.5 w-3.5" />
            Block
          </>
        )}
      </button>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async (role) => {
    setLoading(true);
    try {
      const query = role === "all" ? "" : `?role=${role}`;
      const res = await axiosInstance.get(`/admin/users${query}`);
      setUsers(res.data.data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(filter);
  }, [filter]);

  const handleToggleBlock = async (id) => {
    setUpdatingId(id);
    setError("");
    try {
      await axiosInstance.patch(`/admin/users/${id}/toggle-block`);
      fetchUsers(filter);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.trim().toLowerCase();
    return users.filter(
      (u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const blockedCount = useMemo(() => users.filter((u) => u.isBlocked).length, [users]);
  const customerCount = useMemo(() => users.filter((u) => u.role === "customer").length, [users]);
  const vendorCount = useMemo(() => users.filter((u) => u.role === "vendor").length, [users]);
  const riderCount = useMemo(() => users.filter((u) => u.role === "rider").length, [users]);

  const roleCounts = useMemo(() => {
    const counts = {};
    users.forEach((u) => {
      counts[u.role] = (counts[u.role] || 0) + 1;
    });
    return counts;
  }, [users]);

  const pieData = useMemo(
    () => Object.entries(roleCounts).map(([role, count]) => ({ name: role, value: count })),
    [roleCounts]
  );

  if (loading) return <UsersSkeleton />;

  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6">
      <AnimStyles />
      <div className="mx-auto max-w-3xl">
        <div className="au-fade-up mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-stone-900">Manage users</h1>
            <p className="mt-1 text-[13.5px] text-stone-500">
              {users.length} account{users.length === 1 ? "" : "s"}
              {blockedCount > 0 && <span className="text-rose-500"> · {blockedCount} blocked</span>}
            </p>
          </div>
        </div>

        {error && (
          <div className="au-fade-up mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          <StatCard
            icon={<IconUsers className="h-4.5 w-4.5" />}
            label="Customers"
            value={customerCount}
            accent="#2563eb"
            delay={0}
          />
          <StatCard
            icon={<IconStore className="h-4.5 w-4.5" />}
            label="Vendors"
            value={vendorCount}
            accent="#7c3aed"
            delay={40}
          />
          <StatCard
            icon={<IconBike className="h-4.5 w-4.5" />}
            label="Riders"
            value={riderCount}
            accent="#16a34a"
            delay={80}
          />
          <StatCard
            icon={<IconBan className="h-4.5 w-4.5" />}
            label="Blocked"
            value={blockedCount}
            accent="#dc2626"
            delay={120}
          />
        </div>

        {/* Role distribution chart */}
        {users.length > 0 && (
          <div
            className="au-fade-up mb-6 rounded-2xl border border-stone-200 bg-white p-6"
            style={{ animationDelay: "160ms" }}
          >
            <p className="mb-4 text-[13px] font-medium text-stone-600">Role distribution</p>
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
                          fill={(ROLE_STYLES[entry.name] || DEFAULT_ROLE_STYLE).hex}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2.5">
                {Object.entries(roleCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([role, count]) => {
                    const s = ROLE_STYLES[role] || DEFAULT_ROLE_STYLE;
                    const pct = users.length ? (count / users.length) * 100 : 0;
                    return (
                      <div key={role} className="flex items-center gap-3">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: s.hex }}
                        />
                        <span className="w-20 shrink-0 text-[12.5px] capitalize text-stone-600">{role}</span>
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

        {/* Search */}
        <div className="au-fade-up relative mb-4" style={{ animationDelay: "200ms" }}>
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded-xl border border-stone-200 py-2.5 pl-10 pr-9 text-[13.5px] text-stone-900 transition-colors placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-stone-300 hover:text-stone-600"
            >
              <IconX className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="au-fade-up mb-6 flex flex-wrap gap-2" style={{ animationDelay: "230ms" }}>
          {ROLE_FILTERS.map((f) => (
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

        {filteredUsers.length === 0 ? (
          <div className="au-fade-up rounded-2xl border border-stone-200 bg-white p-10 text-center" style={{ animationDelay: "260ms" }}>
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-stone-50">
              <IconInbox className="h-5 w-5 text-stone-400" />
            </div>
            <p className="text-[13.5px] text-stone-500">
              {search ? `No users match "${search}".` : "No users in this category."}
            </p>
          </div>
        ) : (
          <div
            className="au-fade-up overflow-hidden rounded-2xl border border-stone-200 bg-white divide-y divide-stone-100"
            style={{ animationDelay: "260ms" }}
          >
            {filteredUsers.map((u, i) => (
              <UserRow
                key={u._id}
                u={u}
                updatingId={updatingId}
                onToggleBlock={handleToggleBlock}
                delay={260 + i * 30}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;