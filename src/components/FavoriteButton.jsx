// src/components/FavoriteButton.jsx
import { useState } from "react";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";

function IconHeart(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 21s-7.5-4.8-10.2-9.4C.3 8.6 1.6 5 5.2 4.3c2-.4 3.9.5 5 2.1a5.7 5.7 0 0 1 1.8-2c2.6-1.9 6.3-1 7.6 2.1 1.6 3.9-1.8 8.8-7.6 12.5Z" />
    </svg>
  );
}

const AnimStyles = () => (
  <style>{`
    @keyframes favPop {
      0% { transform: scale(1); }
      35% { transform: scale(1.35); }
      60% { transform: scale(0.92); }
      100% { transform: scale(1); }
    }
    @keyframes favBurst {
      0% { transform: scale(0.3); opacity: 0.55; }
      100% { transform: scale(1.9); opacity: 0; }
    }
    @keyframes favRing {
      0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.28); }
      50% { box-shadow: 0 0 0 4px rgba(239,68,68,0); }
    }
    .fav-pop { animation: favPop 0.38s cubic-bezier(0.16,1,0.3,1); }
    .fav-burst { animation: favBurst 0.45s ease-out forwards; }
    .fav-ring { animation: favRing 2s ease-out infinite; }
  `}</style>
);

function FavoriteButton({ restaurantId, className = "" }) {
  const { user } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();
  const { toast } = useAlert();
  const [busy, setBusy] = useState(false);
  const [popped, setPopped] = useState(false);
  const [bursting, setBursting] = useState(false);

  if (user?.role !== "customer") return null;

  const favorited = isFavorited(restaurantId);

  const handleClick = async (e) => {
    e.preventDefault(); // prevent navigating if this sits inside a <Link> card
    e.stopPropagation();
    setBusy(true);
    setPopped(true);
    window.setTimeout(() => setPopped(false), 380);

    try {
      const nowFavorited = await toggleFavorite(restaurantId);
      if (nowFavorited) {
        setBursting(true);
        window.setTimeout(() => setBursting(false), 450);
      }
      toast.success(nowFavorited ? "Added to favorites" : "Removed from favorites");
    } catch (err) {
      toast.error("Failed to update favorites");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className={
        "group relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 " +
        (favorited
          ? "border-red-100 bg-white text-red-500 shadow-md shadow-red-900/[0.08]"
          : "border-white/60 bg-white/90 text-stone-500 shadow-sm backdrop-blur-sm hover:border-red-100 hover:text-red-500 hover:shadow-md hover:shadow-red-900/[0.08]") +
        " " + className
      }
    >
      {/* radiating burst ring on favorite */}
      {bursting && (
        <span className="absolute inset-0 border-2 border-red-400 rounded-full pointer-events-none fav-burst" />
      )}

      {/* idle pulse while favorited */}
      {favorited && !busy && (
        <span className="absolute inset-0 rounded-full pointer-events-none fav-ring" />
      )}

      <IconHeart
        className={
          "relative h-4 w-4 transition-transform duration-150 " +
          (popped ? "fav-pop" : "") + " " +
          (!favorited ? "group-hover:scale-110" : "")
        }
        fill={favorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={favorited ? "0" : "1.8"}
      />
      <AnimStyles />
    </button>
  );
}

export default FavoriteButton;