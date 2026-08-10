// src/pages/AdminPayouts.jsx
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAlert } from "../context/AlertContext";

const STATUS_STYLE = {
  pending: { bg: "bg-amber-50", text: "text-amber-700" },
  processing: { bg: "bg-blue-50", text: "text-blue-700" },
  paid: { bg: "bg-green-50", text: "text-green-700" },
  failed: { bg: "bg-red-50", text: "text-red-700" },
};

const currency = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);

function AdminPayouts() {
  const { toast } = useAlert();
  const [payouts, setPayouts] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchPayouts = async (status) => {
    setLoading(true);
    try {
      const query = status === "all" ? "" : `?status=${status}`;
      const res = await axiosInstance.get(`/payouts/admin/all${query}`);
      setPayouts(res.data.data.payouts);
    } catch (err) {
      toast.error("Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleProcess = async (id) => {
    setProcessingId(id);
    try {
      await axiosInstance.patch(`/payouts/admin/${id}/process`);
      toast.success("Payout processed");
      fetchPayouts(filter);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process payout");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-6 text-2xl font-bold text-orange-600">Vendor Payouts</h1>

        <div className="flex gap-2 mb-6">
          {["pending", "processing", "paid", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium capitalize transition-colors ${
                filter === f ? "bg-orange-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : payouts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white shadow-md rounded-xl">
            No payouts in this view.
          </div>
        ) : (
          <div className="space-y-3">
            {payouts.map((p) => {
              const style = STATUS_STYLE[p.status] || STATUS_STYLE.pending;
              return (
                <div key={p._id} className="p-5 bg-white shadow-md rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{p.restaurant?.name}</p>
                      <p className="text-sm text-gray-500">{p.vendor?.name} · {p.vendor?.email}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${style.bg} ${style.text}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{p.orderCount} orders</span>
                    <span className="font-semibold text-gray-900">₹{currency(p.amount)}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(p.periodStart).toLocaleDateString()} – {new Date(p.periodEnd).toLocaleDateString()}
                  </p>
                  {p.payoutReference && (
                    <p className="mt-1 font-mono text-xs text-gray-400">Ref: {p.payoutReference}</p>
                  )}

                  {p.status === "pending" && (
                    <button
                      onClick={() => handleProcess(p._id)}
                      disabled={processingId === p._id}
                      className="w-full py-2 mt-3 text-sm font-medium text-white transition bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {processingId === p._id ? "Processing..." : "Process payout"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPayouts;