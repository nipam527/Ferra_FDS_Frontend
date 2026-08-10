// src/pages/AddMenuItem.jsx
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAlert } from "../context/AlertContext";

function IconImage(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}
function IconX(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function IconArrowLeft(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

const AnimStyles = () => (
  <style>{`
    @keyframes amFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .am-fade-up { animation: amFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) backwards; }
  `}</style>
);

function AddMenuItem() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { toast } = useAlert();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isVeg: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image.");
      return;
    }
    setError("");
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append("isVeg", formData.isVeg);
      if (imageFile) data.append("image", imageFile);

      await axiosInstance.post(`/menu-items/${restaurantId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Menu item added");
      setFormData({ name: "", description: "", price: "", category: "", isVeg: true });
      setImageFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add menu item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6">
      <AnimStyles />
      <div className="mx-auto max-w-md">
        <div className="am-fade-up mb-7 flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-stone-900">
              Add menu item
            </h1>
            <p className="mt-1 text-[13.5px] text-stone-500">
              Add a new dish to your menu
            </p>
          </div>
          <button
            onClick={() => navigate(`/vendor/restaurants/${restaurantId}/menu`)}
            className="flex items-center gap-1 text-[13px] font-medium text-stone-500 transition-colors hover:text-stone-900"
          >
            <IconArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
        </div>

        <div
          className="am-fade-up rounded-2xl border border-stone-200 bg-white p-6"
          style={{ animationDelay: "60ms" }}
        >
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-[12.5px] font-medium text-stone-600">
                Item image
              </label>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 transition-colors ${
                  isDragging
                    ? "border-amber-500 bg-amber-50"
                    : "border-stone-200 hover:border-amber-300 hover:bg-stone-50"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />

                {preview ? (
                  <div className="space-y-3">
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-44 w-full rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageFile(null);
                        setPreview(null);
                      }}
                      className="relative z-10 flex w-full items-center justify-center gap-1.5 rounded-full border border-red-200 bg-red-50 py-2 text-[12.5px] font-medium text-red-600 transition-colors hover:bg-red-100"
                    >
                      <IconX className="h-3.5 w-3.5" />
                      Remove image
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                      <IconImage className="h-5 w-5" />
                    </div>
                    <p className="text-[13.5px] font-medium text-stone-700">
                      Drag & drop your image
                    </p>
                    <p className="mt-1 text-[12.5px] text-stone-400">or click to browse</p>
                    <p className="mt-2 text-[11px] text-stone-300">JPG · PNG · WEBP</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-stone-600">
                Item name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-[13.5px] text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-stone-600">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-[13.5px] text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium text-stone-600">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-[13.5px] text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium text-stone-600">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Starters"
                  required
                  className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-[13.5px] text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 rounded-lg border border-stone-200 px-3.5 py-2.5 text-[13px] text-stone-700">
              <input
                type="checkbox"
                name="isVeg"
                checked={formData.isVeg}
                onChange={handleChange}
                className="h-4 w-4 rounded accent-amber-600"
              />
              Vegetarian
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-stone-900 py-2.5 text-[13.5px] font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add item"}
            </button>
          </form>
        </div>

        <Link
          to={`/vendor/restaurants/${restaurantId}/menu`}
          className="am-fade-up mt-5 flex items-center justify-center text-[13.5px] font-medium text-stone-600 transition-colors hover:text-stone-900"
          style={{ animationDelay: "100ms" }}
        >
          View full menu
        </Link>
      </div>
    </div>
  );
}

export default AddMenuItem;