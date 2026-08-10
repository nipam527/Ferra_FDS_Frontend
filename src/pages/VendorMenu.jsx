// src/pages/VendorMenu.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { getImageUrl } from "../utils/getImageUrl";
import { useAlert } from "../context/AlertContext";


function IconEdit(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
function IconTrash(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
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

const currency = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);

function VendorMenu() {
  const { restaurantId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingItem, setEditingItem] = useState(null); // full item object being edited, or null

  const fetchItems = async () => {
    try {
      const res = await axiosInstance.get(`/menu-items/mine/${restaurantId}`);
      setItems(res.data.data.menuItems);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load menu items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [restaurantId]);

  const handleToggle = async (id) => {
  setTogglingId(id);
  try {
    const res = await axiosInstance.patch(`/menu-items/item/${id}/toggle`);
    toast.success(res.data.data.menuItem.isAvailable ? "Marked available" : "Marked unavailable");
    fetchItems();
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to update item");
  } finally {
    setTogglingId(null);
  }
};

  const { toast, confirm } = useAlert();

  
const handleDelete = async (id) => {
  const ok = await confirm({
    title: "Delete this item?",
    message: "This will permanently remove it from your menu.",
    confirmText: "Delete",
    variant: "danger",
  });
  if (!ok) return;

  setDeletingId(id);
  try {
    await axiosInstance.delete(`/menu-items/item/${id}`);
    setItems((prev) => prev.filter((i) => i._id !== id));
    toast.success("Item deleted");
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to delete item");
  } finally {
    setDeletingId(null);
  }
};

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen px-4 py-10 bg-white sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-stone-900">
              Menu
            </h1>
            <p className="mt-1 text-[13.5px] text-stone-500">
              {items.length} item{items.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/vendor/restaurants/${restaurantId}/add-menu-item`}
              className="flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2.5 text-[13px] font-medium text-white hover:bg-stone-800"
            >
              <IconPlus className="h-3.5 w-3.5" />
              Add item
            </Link>
            <Link
              to="/vendor/dashboard"
              className="text-[13px] font-medium text-stone-500 hover:text-stone-900"
            >
              ← Back
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-[13.5px] text-stone-400">Loading...</p>
        ) : items.length === 0 ? (
          <div className="p-8 text-center border rounded-2xl border-stone-200">
            <p className="text-[13.5px] text-stone-500">No menu items yet.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, categoryItems]) => (
            <div key={category} className="mb-8">
              <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-stone-400">
                {category}
              </h2>
              <div className="space-y-3">
                {categoryItems.map((item) => (
                  <div
                    key={item._id}
                    className={`flex items-center gap-3 rounded-2xl border p-3 transition-opacity ${
                      item.isAvailable ? "border-stone-200" : "border-stone-100 opacity-60"
                    }`}
                  >
                    <div className="w-16 h-16 overflow-hidden shrink-0 rounded-xl bg-stone-50">
                      {item.image ? (
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-stone-300">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-sm border ${
                            item.isVeg ? "border-green-600" : "border-red-600"
                          }`}
                        >
                          <span
                            className={`block h-1 w-1 rounded-full m-auto mt-[3px] ${
                              item.isVeg ? "bg-green-600" : "bg-red-600"
                            }`}
                          />
                        </span>
                        <p className="truncate text-[13.5px] font-medium text-stone-900">
                          {item.name}
                        </p>
                      </div>
                      <p className="text-[12.5px] tabular-nums text-stone-500">₹{currency(item.price)}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => handleToggle(item._id)}
                        disabled={togglingId === item._id}
                        className={`rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-colors disabled:opacity-50 ${
                          item.isAvailable
                            ? "bg-stone-100 text-stone-600 hover:bg-stone-200"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        }`}
                      >
                        {togglingId === item._id
                          ? "..."
                          : item.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </button>
                      <button
                        onClick={() => setEditingItem(item)}
                        className="flex items-center justify-center w-8 h-8 transition-colors rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                      >
                        <IconEdit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        disabled={deletingId === item._id}
                        className="flex items-center justify-center w-8 h-8 transition-colors rounded-full text-stone-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <IconTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={() => {
            setEditingItem(null);
            fetchItems();
          }}
        />
      )}
    </div>
  );
}

function EditItemModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: item.name,
    description: item.description || "",
    price: item.price,
    category: item.category,
    isVeg: item.isVeg,
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("description", form.description);
      data.append("price", form.price);
      data.append("category", form.category);
      data.append("isVeg", form.isVeg);
      if (imageFile) data.append("image", imageFile);

      await axiosInstance.put(`/menu-items/item/${item._id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-stone-900/40">
      <div className="w-full max-w-sm p-6 bg-white border shadow-xl rounded-2xl border-stone-200">
        <h2 className="mb-4 text-[15px] font-semibold text-stone-900">Edit item</h2>

        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={2}
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0"
              required
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <label className="flex items-center gap-2 text-[13px] text-stone-600">
            <input type="checkbox" name="isVeg" checked={form.isVeg} onChange={handleChange} />
            Vegetarian
          </label>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-stone-500">
              Replace image (optional)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full text-[12.5px] text-stone-500 file:mr-3 file:rounded-full file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-[12px] file:font-medium file:text-stone-700"
            />
            
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-stone-200 py-2 text-[13px] font-medium text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-full bg-stone-900 py-2 text-[13px] font-medium text-white hover:bg-stone-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VendorMenu;