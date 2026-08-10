// src/pages/CreateRestaurant.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
function IconPin(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}
function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
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
    @keyframes crFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .cr-fade-up { animation: crFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) backwards; }
  `}</style>
);

function CreateRestaurant() {
  const navigate = useNavigate();
  const { toast } = useAlert();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cuisineType: "",
    street: "",
    city: "",
    pincode: "",
    openTime: "09:00",
    closeTime: "22:00",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [locError, setLocError] = useState("");
  const [locatingNow, setLocatingNow] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUseLocation = () => {
    setLocError("");
    if (!navigator.geolocation) {
      setLocError("Geolocation not supported in this browser");
      return;
    }
    setLocatingNow(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocatingNow(false);
      },
      (err) => {
        setLocError("Could not get location: " + err.message);
        setLocatingNow(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("cuisineType", formData.cuisineType);
      data.append("street", formData.street);
      data.append("city", formData.city);
      data.append("pincode", formData.pincode);
      data.append("openTime", formData.openTime);
      data.append("closeTime", formData.closeTime);
      if (imageFile) data.append("image", imageFile);
      if (coords.lat && coords.lng) {
        data.append("lat", coords.lat);
        data.append("lng", coords.lng);
      }

      await axiosInstance.post("/restaurants", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Restaurant created", "Pending admin approval");
      navigate("/vendor/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create restaurant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-white sm:px-6">
      <AnimStyles />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between cr-fade-up mb-7">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-stone-900">
              Create your restaurant
            </h1>
            <p className="mt-1 text-[13.5px] text-stone-500">
              Submit details for admin review
            </p>
          </div>
          <button
            onClick={() => navigate("/vendor/dashboard")}
            className="flex items-center gap-1 text-[13px] font-medium text-stone-500 transition-colors hover:text-stone-900"
          >
            <IconArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
        </div>

        <div
          className="p-6 bg-white border cr-fade-up rounded-2xl border-stone-200 sm:p-8"
          style={{ animationDelay: "60ms" }}
        >
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 md:grid-cols-[280px_1fr]">
              {/* Left column — image + location */}
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-[12.5px] font-medium text-stone-600">
                    Restaurant image
                  </label>
                  <div className="relative overflow-hidden transition-colors border-2 border-dashed cursor-pointer aspect-square rounded-2xl border-stone-200 hover:border-amber-300 hover:bg-stone-50">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="absolute inset-0 z-10 opacity-0 cursor-pointer"
                    />
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full text-center">
                        <div className="flex items-center justify-center mb-3 rounded-full h-11 w-11 bg-stone-100 text-stone-400">
                          <IconImage className="w-5 h-5" />
                        </div>
                        <p className="text-[13.5px] font-medium text-stone-700">
                          Click to upload
                        </p>
                        <p className="mt-1 text-[12px] text-stone-400">JPG · PNG · WEBP</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-stone-100 bg-stone-50 p-3.5">
                  <button
                    type="button"
                    onClick={handleUseLocation}
                    disabled={locatingNow}
                    className="flex items-center gap-1.5 text-[12.5px] font-medium text-amber-700 hover:text-amber-800 disabled:opacity-50"
                  >
                    <IconPin className="h-3.5 w-3.5" />
                    {locatingNow ? "Locating..." : "Use my current location"}
                  </button>
                  {coords.lat && (
                    <p className="mt-1.5 flex items-start gap-1 text-[11.5px] text-green-600">
                      <IconCheck className="mt-0.5 h-3 w-3 shrink-0" />
                      Captured ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
                    </p>
                  )}
                  {locError && <p className="mt-1.5 text-[11.5px] text-red-600">{locError}</p>}
                </div>
              </div>

              {/* Right column — details */}
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-[12.5px] font-medium text-stone-600">
                      Restaurant name
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

                  <div className="sm:col-span-2">
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

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-[12.5px] font-medium text-stone-600">
                      Cuisine types
                    </label>
                    <input
                      type="text"
                      name="cuisineType"
                      value={formData.cuisineType}
                      onChange={handleChange}
                      placeholder="North Indian, Chinese"
                      className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-[13.5px] text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                    />
                    <p className="mt-1 text-[11.5px] text-stone-400">Comma separated</p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-[12.5px] font-medium text-stone-600">
                      Street
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-[13.5px] text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12.5px] font-medium text-stone-600">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-[13.5px] text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[12.5px] font-medium text-stone-600">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-[13.5px] text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12.5px] font-medium text-stone-600">
                      Opens
                    </label>
                    <input
                      type="time"
                      name="openTime"
                      value={formData.openTime}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-[13.5px] text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[12.5px] font-medium text-stone-600">
                      Closes
                    </label>
                    <input
                      type="time"
                      name="closeTime"
                      value={formData.closeTime}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-[13.5px] text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t mt-7 border-stone-100">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-stone-900 px-8 py-2.5 text-[13.5px] font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create restaurant"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateRestaurant;