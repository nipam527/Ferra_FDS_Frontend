// src/pages/AdminCoupons.jsx
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);

function IconTicket(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" />
      <path d="M9 6v12" strokeDasharray="2 3" />
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
function IconClock(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
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
function IconPlus(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5v14M5 12h14" />
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
function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

const AnimStyles = () => (
  <style>{`
    @keyframes acFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes acShimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
    @keyframes acFormIn {
      from { opacity: 0; transform: translateY(-6px); max-height: 0; }
      to { opacity: 1; transform: translateY(0); max-height: 900px; }
    }
    .ac-fade-up { animation: acFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) backwards; }
    .ac-form-in { animation: acFormIn 0.35s cubic-bezier(0.16,1,0.3,1); overflow: hidden; }
    .ac-shimmer {
      background: linear-gradient(90deg, #f5f5f4 25%, #fafaf9 37%, #f5f5f4 63%);
      background-size: 400px 100%;
      animation: acShimmer 1.4s ease-in-out infinite;
    }
  `}</style>
);

function CouponsSkeleton() {
  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6">
      <AnimStyles />
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 h-7 w-48 rounded ac-shimmer" />
        <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl border border-stone-200 ac-shimmer" />
          ))}
        </div>
        <div className="overflow-hidden rounded-2xl border border-stone-200">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[72px] border-b border-stone-100 last:border-0 ac-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent, delay }) {
  return (
    <div
      className="ac-fade-up group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-16px_rgba(28,25,23,0.16)]"
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

const inputCls =
  "w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-[13.5px] text-stone-900 transition-colors placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100";
const labelCls = "mb-1.5 block text-[12px] font-medium text-stone-600";

function CouponCard({ c, togglingId, onToggle, delay }) {
  const isExpired = new Date(c.expiryDate) < new Date();
  const isUpdating = togglingId === c._id;

  return (
    <div
      className="ac-fade-up group flex items-center gap-3.5 p-4 transition-colors duration-150 hover:bg-stone-50/70"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          c.isActive && !isExpired ? "bg-amber-50 text-amber-600" : "bg-stone-100 text-stone-400"
        }`}
      >
        <IconTicket className="h-4.5 w-4.5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="font-mono text-[13.5px] font-semibold tracking-wide text-stone-900">{c.code}</p>
          <span
            className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium ${
              c.isActive ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"
            }`}
          >
            {c.isActive ? "active" : "inactive"}
          </span>
          {isExpired && (
            <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10.5px] font-medium text-rose-600">
              <IconClock className="h-2.5 w-2.5" />
              expired
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[12.5px] text-stone-500">
          {c.discountType === "flat" ? `₹${currency(c.discountValue)} off` : `${c.discountValue}% off`}
          {c.minOrderValue > 0 && ` · min ₹${currency(c.minOrderValue)}`}
          {c.usageLimit && ` · ${c.usedCount || 0}/${c.usageLimit} used`}
        </p>
        <p className="mt-0.5 text-[11.5px] text-stone-400">
          Expires {new Date(c.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>

      <button
        onClick={() => onToggle(c._id)}
        disabled={isUpdating}
        className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
          c.isActive
            ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
            : "bg-emerald-600 text-white hover:bg-emerald-700"
        }`}
      >
        {isUpdating ? (
          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : c.isActive ? (
          <>
            <IconBan className="h-3.5 w-3.5" />
            Deactivate
          </>
        ) : (
          <>
            <IconCheck className="h-3.5 w-3.5" />
            Activate
          </>
        )}
      </button>
    </div>
  );
}

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    discountType: "flat",
    discountValue: "",
    minOrderValue: "",
    maxDiscount: "",
    expiryDate: "",
    usageLimit: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await axiosInstance.get("/coupons");
      setCoupons(res.data.data.coupons);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await axiosInstance.post("/coupons", {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      });
      setFormData({
        code: "",
        discountType: "flat",
        discountValue: "",
        minOrderValue: "",
        maxDiscount: "",
        expiryDate: "",
        usageLimit: "",
      });
      setShowForm(false);
      fetchCoupons();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    setTogglingId(id);
    try {
      await axiosInstance.patch(`/coupons/${id}/toggle`);
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update coupon");
    } finally {
      setTogglingId(null);
    }
  };

  const activeCount = useMemo(() => coupons.filter((c) => c.isActive && new Date(c.expiryDate) >= new Date()).length, [coupons]);
  const expiredCount = useMemo(() => coupons.filter((c) => new Date(c.expiryDate) < new Date()).length, [coupons]);
  const totalUses = useMemo(() => coupons.reduce((s, c) => s + (c.usedCount || 0), 0), [coupons]);

  const filteredCoupons = useMemo(() => {
    if (!search.trim()) return coupons;
    const q = search.trim().toLowerCase();
    return coupons.filter((c) => c.code?.toLowerCase().includes(q));
  }, [coupons, search]);

  if (loading) return <CouponsSkeleton />;

  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6">
      <AnimStyles />
      <div className="mx-auto max-w-3xl">
        <div className="ac-fade-up mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-stone-900">Manage coupons</h1>
            <p className="mt-1 text-[13.5px] text-stone-500">Create and control platform discounts.</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2.5 text-[13px] font-medium text-white transition-colors duration-150 hover:bg-stone-800"
          >
            {showForm ? <IconX className="h-3.5 w-3.5" /> : <IconPlus className="h-3.5 w-3.5" />}
            {showForm ? "Cancel" : "New coupon"}
          </button>
        </div>

        {error && (
          <div className="ac-fade-up mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3">
          <StatCard
            icon={<IconTicket className="h-4.5 w-4.5" />}
            label="Total coupons"
            value={coupons.length}
            accent="#d97706"
            delay={0}
          />
          <StatCard
            icon={<IconCheck className="h-4.5 w-4.5" />}
            label="Active"
            value={activeCount}
            accent="#16a34a"
            delay={40}
          />
          <StatCard
            icon={<IconClock className="h-4.5 w-4.5" />}
            label="Expired"
            value={expiredCount}
            accent="#dc2626"
            delay={80}
          />
        </div>

        {/* New coupon form */}
        {showForm && (
          <div
            className="ac-form-in mb-6 rounded-2xl border border-stone-200 bg-white p-6"
          >
            <p className="mb-4 text-[13px] font-medium text-stone-600">Coupon details</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[12.5px] text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Code</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    placeholder="SAVE50"
                    className={`${inputCls} font-mono uppercase`}
                  />
                </div>
                <div>
                  <label className={labelCls}>Type</label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    className={inputCls}
                  >
                    <option value="flat">Flat (₹)</option>
                    <option value="percent">Percent (%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Discount value</label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleChange}
                    required
                    min="1"
                    className={inputCls}
                  />
                </div>
                {formData.discountType === "percent" && (
                  <div>
                    <label className={labelCls}>Max discount (₹)</label>
                    <input
                      type="number"
                      name="maxDiscount"
                      value={formData.maxDiscount}
                      onChange={handleChange}
                      placeholder="Optional cap"
                      className={inputCls}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Min order value</label>
                  <input
                    type="number"
                    name="minOrderValue"
                    value={formData.minOrderValue}
                    onChange={handleChange}
                    placeholder="0"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Usage limit</label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleChange}
                    placeholder="Unlimited"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Expiry date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  required
                  className={inputCls}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-stone-900 py-3 text-[13.5px] font-medium text-white shadow-sm transition-all duration-200 hover:bg-stone-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Creating…" : "Create coupon"}
              </button>
            </form>
          </div>
        )}

        {/* Search */}
        {coupons.length > 0 && (
          <div className="ac-fade-up relative mb-4" style={{ animationDelay: "120ms" }}>
            <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by coupon code…"
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
        )}

        {/* Coupon list */}
        {filteredCoupons.length === 0 ? (
          <div className="ac-fade-up rounded-2xl border border-stone-200 bg-white p-10 text-center" style={{ animationDelay: "160ms" }}>
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-stone-50">
              <IconInbox className="h-5 w-5 text-stone-400" />
            </div>
            <p className="text-[13.5px] text-stone-500">
              {search ? `No coupons match "${search}".` : "No coupons created yet."}
            </p>
          </div>
        ) : (
          <div
            className="ac-fade-up overflow-hidden rounded-2xl border border-stone-200 bg-white divide-y divide-stone-100"
            style={{ animationDelay: "160ms" }}
          >
            {filteredCoupons.map((c, i) => (
              <CouponCard key={c._id} c={c} togglingId={togglingId} onToggle={handleToggle} delay={160 + i * 30} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCoupons;