// src/pages/Favorites.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { getImageUrl } from "../utils/getImageUrl";
import { useFavorites } from "../context/FavoritesContext";

function IconHeart(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 21s-7.5-4.8-10.2-9.4C.3 8.6 1.6 5 5.2 4.3c2-.4 3.9.5 5 2.1a5.7 5.7 0 0 1 1.8-2c2.6-1.9 6.3-1 7.6 2.1 1.6 3.9-1.8 8.8-7.6 12.5Z" />
    </svg>
  );
}

function Favorites() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { favoriteIds } = useFavorites();

  const fetchFavorites = async () => {
    try {
      const res = await axiosInstance.get("/favorites");
      setRestaurants(res.data.data.restaurants);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load favorites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-sync the list if a favorite is removed elsewhere (e.g. from the heart on this same page)
  useEffect(() => {
    setRestaurants((prev) => prev.filter((r) => favoriteIds.has(r._id)));
  }, [favoriteIds]);

  return (
    <div className="min-h-screen px-4 py-10 bg-white sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-[22px] font-semibold tracking-tight text-stone-900">
          My favorites
        </h1>
        <p className="mt-1 text-[13.5px] text-stone-500">
          Restaurants you've saved for later
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="mt-6 text-[13.5px] text-stone-400">Loading...</p>
        ) : restaurants.length === 0 ? (
          <div className="p-10 mt-6 text-center border rounded-2xl border-stone-200">
            <div className="flex items-center justify-center mx-auto mb-4 rounded-full h-14 w-14 bg-stone-50">
              <IconHeart className="w-6 h-6 text-stone-300" />
            </div>
            <h2 className="text-[15px] font-semibold text-stone-900">No favorites yet</h2>
            <p className="mt-1.5 text-[13.5px] text-stone-500">
              Tap the heart on any restaurant to save it here.
            </p>
            <Link
              to="/"
              className="mt-5 inline-block rounded-full bg-stone-900 px-5 py-2.5 text-[13.5px] font-medium text-white hover:bg-stone-800"
            >
              Browse restaurants
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 md:grid-cols-3">
            {restaurants.map((r) => (
              <Link
                key={r._id}
                to={`/restaurants/${r._id}`}
                className="overflow-hidden transition-shadow bg-white border rounded-2xl border-stone-200 hover:shadow-sm"
              >
                <div className="relative w-full h-36 bg-stone-100">
                  {r.images?.[0] ? (
                    <img src={getImageUrl(r.images[0])} alt={r.name} className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[12px] text-stone-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-[14.5px] font-semibold text-stone-900">{r.name}</h2>
                  <p className="mt-0.5 text-[12.5px] text-stone-500">
                    {r.cuisineType?.join(", ") || "Various cuisines"}
                  </p>
                  <p className="mt-1 text-[12px] text-stone-400">{r.address?.city}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;