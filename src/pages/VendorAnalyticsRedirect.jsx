// src/pages/VendorAnalyticsRedirect.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

// Navbar links here with no restaurant ID in the URL. This page fetches the
// vendor's restaurants and either redirects straight to the analytics page
// (if there's exactly one) or lets them pick (if there's more than one).
function VendorAnalyticsRedirect() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const res = await axiosInstance.get("/restaurants/mine");
        const list = res.data.data.restaurants;
        setRestaurants(list);

        if (list.length === 1) {
          navigate(`/vendor/restaurants/${list[0]._id}/analytics`, { replace: true });
        }
      } catch (err) {
        setError(err.response?.data?.message || "Couldn't load your restaurants.");
      } finally {
        setLoading(false);
      }
    };
    fetchAndRedirect();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-[13.5px] text-stone-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <p className="text-[13.5px] text-red-600">{error}</p>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="rounded-2xl border border-stone-200 p-8 text-center">
          <p className="text-[14px] text-stone-600">
            You don't have a restaurant yet.
          </p>
          <Link
            to="/vendor/create-restaurant"
            className="mt-4 inline-block rounded-full bg-stone-900 px-5 py-2.5 text-[13.5px] font-medium text-white hover:bg-stone-800"
          >
            Create Restaurant
          </Link>
        </div>
      </div>
    );
  }

  // more than one restaurant — let them choose
  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-[20px] font-semibold text-stone-900">
          Choose a restaurant
        </h1>
        <div className="space-y-3">
          {restaurants.map((r) => (
            <Link
              key={r._id}
              to={`/vendor/restaurants/${r._id}/analytics`}
              className="block rounded-2xl border border-stone-200 p-4 transition-colors hover:border-stone-300"
            >
              <p className="text-[14px] font-medium text-stone-900">{r.name}</p>
              <p className="text-[12.5px] text-stone-500">{r.address?.city}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VendorAnalyticsRedirect;