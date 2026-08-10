// src/components/ReviewForm.jsx
import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-2xl transition-colors ${
            n <= value ? "text-amber-500" : "text-stone-200"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ order, onSubmitted }) {
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [restaurantComment, setRestaurantComment] = useState("");
  const [riderRating, setRiderRating] = useState(0);
  const [riderComment, setRiderComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (restaurantRating === 0) {
      setError("Please rate the restaurant");
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post("/reviews", {
        orderId: order._id,
        restaurantRating,
        restaurantComment,
        riderRating: order.rider ? riderRating : undefined,
        riderComment: order.rider ? riderComment : undefined,
      });
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {error}
        </div>
      )}

      <div>
        <p className="mb-2 text-[13px] font-medium text-stone-700">
          Rate {order.restaurant?.name}
        </p>
        <StarPicker value={restaurantRating} onChange={setRestaurantRating} />
        <textarea
          value={restaurantComment}
          onChange={(e) => setRestaurantComment(e.target.value)}
          placeholder="How was the food?"
          rows={2}
          className="mt-2 w-full rounded-lg border border-stone-200 px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {order.rider && (
        <div>
          <p className="mb-2 text-[13px] font-medium text-stone-700">
            Rate your delivery partner
          </p>
          <StarPicker value={riderRating} onChange={setRiderRating} />
          <textarea
            value={riderComment}
            onChange={(e) => setRiderComment(e.target.value)}
            placeholder="How was the delivery?"
            rows={2}
            className="mt-2 w-full rounded-lg border border-stone-200 px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-stone-900 py-2.5 text-[13.5px] font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

export default ReviewForm;