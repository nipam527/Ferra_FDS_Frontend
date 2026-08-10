// src/components/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import NotificationBell from "./NotificationBell";

function IconCart(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6" />
    </svg>
  );
}
function IconChevron(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function IconMenu(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
function IconClose(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function IconMapPin(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}
function IconLogOut(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
function IconLocateFixed(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  );
}
function IconTag(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m20.5 12.5-8 8a2 2 0 0 1-2.8 0l-6.2-6.2a2 2 0 0 1 0-2.8l8-8A2 2 0 0 1 13 3h5.5A2.5 2.5 0 0 1 21 5.5V11a2 2 0 0 1-.5 1.5Z" />
      <circle cx="15.5" cy="8.5" r="1.5" />
    </svg>
  );
}

// Custom mark: three fork tines resolving into a single "F" stem —
// unique to this brand rather than a generic food glyph.
function Logomark({ className }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="12" fill="#1C1917" />
      <path
        d="M13 10v7.5c0 1.5 1 2.5 2.3 2.7V30a1.3 1.3 0 0 0 2.6 0v-9.8c1.3-.2 2.3-1.2 2.3-2.7V10a1 1 0 0 0-2 0v6a.8.8 0 0 1-1.6 0v-6a1 1 0 0 0-2 0v6a.8.8 0 0 1-1.6 0v-6a1 1 0 0 0-2 0Z"
        fill="#FBBF24"
      />
      <path
        d="M25.5 10c-2.2 0-4 2.3-4 5.4 0 2.2.9 4.1 2.3 4.9v9.4a1.3 1.3 0 0 0 2.6 0v-9.4c1.4-.8 2.3-2.7 2.3-4.9 0-3.1-1.8-5.4-4-5.4Z"
        fill="#FBBF24"
        opacity="0.55"
      />
    </svg>
  );
}

const navLinkClass = ({ isActive }) =>
  [
    "relative py-1.5 text-[13.5px] font-medium tracking-wide transition-colors",
    isActive ? "text-stone-900" : "text-stone-500 hover:text-stone-900",
    "after:absolute after:left-0 after:-bottom-[3px] after:h-[2px] after:rounded-full after:bg-amber-600 after:transition-all after:duration-300 after:ease-out",
    isActive ? "after:w-full" : "after:w-0 hover:after:w-full",
  ].join(" ");

const mobileLinkClass = ({ isActive }) =>
  [
    "flex items-center justify-between rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors",
    isActive ? "bg-amber-50 text-amber-800" : "text-stone-700 hover:bg-stone-50",
  ].join(" ");

// role -> nav links, kept as data so both desktop and mobile render from one source
const ROLE_LINKS = {
  customer: [
    { to: "/orders", label: "My Orders" },
    { to: "/favorites", label: "Favorites" },
  ],
  vendor: [
    { to: "/vendor/dashboard", label: "My Restaurants" },
    { to: "/vendor/analytics", label: "Analytics" },
  ],
  rider: [{ to: "/rider/dashboard", label: "Deliveries" }],
  admin: [{ to: "/admin/dashboard", label: "Admin" }],
};

const LOCATION_STORAGE_KEY = "farro:deliveryLocation";

function Navbar({ deliveryLocation: initialDeliveryLocation = "Set location" }) {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  // ---- Delivery location state (fully self-contained) ----
  const [deliveryLocation, setDeliveryLocation] = useState(() => {
    try {
      return localStorage.getItem(LOCATION_STORAGE_KEY) || initialDeliveryLocation;
    } catch {
      return initialDeliveryLocation;
    }
  });
  const [locationOpen, setLocationOpen] = useState(false); // desktop popover
  const [mobileLocationOpen, setMobileLocationOpen] = useState(false); // mobile inline panel
  const [locationInput, setLocationInput] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const locationRef = useRef(null);

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const roleLinks = user?.role ? ROLE_LINKS[user.role] || [] : [];

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // close desktop location popover on outside click
  useEffect(() => {
    function onClick(e) {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setLocationOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the mobile panel automatically if the viewport grows past the breakpoint
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
        setMobileLocationOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const persistLocation = (label) => {
    setDeliveryLocation(label);
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, label);
    } catch {
      // ignore storage errors (private mode, etc.)
    }
  };

  const handleSubmitLocation = (e) => {
    e.preventDefault();
    const trimmed = locationInput.trim();
    if (!trimmed) return;
    persistLocation(trimmed);
    setLocationInput("");
    setLocationError("");
    setLocationOpen(false);
    setMobileLocationOpen(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation isn't supported on this device.");
      return;
    }
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const label =
            data?.address?.suburb ||
            data?.address?.neighbourhood ||
            data?.address?.city ||
            data?.address?.town ||
            data?.display_name ||
            "Current location";
          persistLocation(label);
        } catch {
          persistLocation("Current location");
        } finally {
          setLocating(false);
          setLocationOpen(false);
          setMobileLocationOpen(false);
        }
      },
      (err) => {
        setLocating(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied."
            : "Couldn't get your location."
        );
      }
    );
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate("/login");
  };

  const initials = (user?.name || user?.email || "U").trim().charAt(0).toUpperCase();

  const LocationForm = ({ autoFocus }) => (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmitLocation} className="flex flex-col gap-2">
        <input
          autoFocus={autoFocus}
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          placeholder="Enter delivery address"
          className="rounded-lg border border-stone-200 px-3 py-2 text-[13px] outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-stone-900 px-3 py-2 text-[13px] font-medium text-white hover:bg-stone-800"
        >
          Save address
        </button>
      </form>
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={locating}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-[13px] font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-50"
      >
        <IconLocateFixed className="w-3.5 h-3.5" />
        {locating ? "Locating…" : "Use current location"}
      </button>
      {locationError && <p className="text-[11.5px] text-red-600">{locationError}</p>}
    </div>
  );

  return (
    <nav
      className={[
        "sticky top-0 z-40 border-b bg-white transition-shadow duration-300",
        scrolled ? "border-stone-200 shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_8px_24px_-16px_rgba(0,0,0,0.15)]" : "border-stone-100",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3.5 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <Logomark className="transition-transform duration-300 ease-out h-11 w-11 group-hover:-rotate-3" />
          <span className="flex-col hidden leading-none sm:flex">
            <span className="text-[21px] font-semibold tracking-tight text-stone-900">
              Farro<span className="text-amber-600">.</span>
            </span>
            <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-stone-400">
              Delivered fresh
            </span>
          </span>
        </Link>

        {/* Delivery location — real-world food-app pattern, sits right after the logo */}
        <div className="relative hidden lg:block" ref={locationRef}>
          <button
            type="button"
            onClick={() => setLocationOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-full py-1.5 pl-2 pr-3 text-[12.5px] font-medium text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900"
          >
            <IconMapPin className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="max-w-[140px] truncate">{deliveryLocation}</span>
            <IconChevron
              className={`h-3 w-3 text-stone-400 transition-transform duration-200 ${
                locationOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={[
              "absolute left-0 z-50 mt-2 w-72 origin-top-left overflow-hidden rounded-xl border border-stone-200 bg-white p-3 shadow-lg shadow-stone-900/[0.08] transition-all duration-150",
              locationOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
            ].join(" ")}
          >
            <LocationForm autoFocus={locationOpen} />
          </div>
        </div>

        {/* Desktop nav */}
        <div className="items-center justify-center flex-1 hidden gap-7 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Restaurants
          </NavLink>
          <NavLink to="/coupons" className={navLinkClass}>
            Offers
          </NavLink>
          {roleLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center ml-auto gap-2.5">
          {user && <NotificationBell />}
          {user?.role === "customer" && (
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative flex items-center justify-center w-10 h-10 transition-colors rounded-full text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            >
              <IconCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-600 px-[3px] text-[10px] font-semibold leading-none text-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="relative hidden md:block" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-stone-200 py-1 pl-1 pr-2.5 text-sm text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-stone-800 to-stone-950 text-[11px] font-semibold text-white">
                  {initials}
                </span>
                <span className="max-w-[100px] truncate text-[13px] font-medium">
                  {user.name || user.email}
                </span>
                <IconChevron className={`h-3.5 w-3.5 text-stone-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              <div
                className={[
                  "absolute right-0 mt-2 w-52 origin-top-right overflow-hidden rounded-xl border border-stone-200 bg-white py-1.5 shadow-lg shadow-stone-900/[0.08] transition-all duration-150",
                  menuOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
                ].join(" ")}
              >
                <div className="px-3.5 py-2.5 border-b border-stone-100">
                  <p className="truncate text-[13px] font-medium text-stone-900">{user.name || "Account"}</p>
                  <p className="truncate text-[11.5px] text-stone-400">{user.email}</p>
                </div>
                {roleLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3.5 py-2 text-[13px] text-stone-700 hover:bg-stone-50"
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-1.5 border-t border-stone-100 px-3.5 py-2 text-left text-[13px] text-red-600 hover:bg-red-50"
                >
                  <IconLogOut className="w-3.5 h-3.5" />
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <div className="items-center hidden gap-1 md:flex">
              <Link
                to="/login"
                className="px-3 py-1.5 text-[13.5px] font-medium text-stone-600 hover:text-stone-900"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-stone-900 px-4 py-1.5 text-[13.5px] font-medium text-white shadow-sm transition-all hover:bg-stone-800 hover:shadow-md"
              >
                Sign up
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex items-center justify-center w-10 h-10 rounded-full text-stone-600 hover:bg-stone-100 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <IconClose className="w-5 h-5" /> : <IconMenu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        className={[
          "grid overflow-hidden border-t border-stone-200 bg-white transition-[grid-template-rows] duration-300 ease-out md:hidden",
          mobileOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr] border-t-0",
        ].join(" ")}
      >
        <div className="min-h-0">
          {/* Account card */}
          {user && (
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-100 bg-stone-50/60">
              <span className="flex items-center justify-center w-10 h-10 text-sm font-semibold text-white rounded-full shrink-0 bg-gradient-to-br from-stone-800 to-stone-950">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-medium text-stone-900">{user.name || "Account"}</p>
                <p className="truncate text-[12px] text-stone-400">{user.email}</p>
              </div>
            </div>
          )}

          {/* Delivery location, mobile */}
          <div className="border-b border-stone-100">
            <button
              type="button"
              onClick={() => setMobileLocationOpen((v) => !v)}
              className="flex w-full items-center gap-2 px-4 py-3 text-[13px] font-medium text-stone-600"
            >
              <IconMapPin className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="truncate">{deliveryLocation}</span>
              <IconChevron
                className={`ml-auto h-3.5 w-3.5 text-stone-400 transition-transform duration-200 ${
                  mobileLocationOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={[
                "grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out",
                mobileLocationOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              ].join(" ")}
            >
              <div className="min-h-0">
                <div className="px-4 pb-3">
                  <LocationForm autoFocus={false} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 px-2.5 py-2.5">
            <NavLink to="/" end onClick={() => setMobileOpen(false)} className={mobileLinkClass}>
              Restaurants
            </NavLink>

            <NavLink to="/coupons" onClick={() => setMobileOpen(false)} className={mobileLinkClass}>
              <span className="flex items-center gap-1.5">
                <IconTag className="w-3.5 h-3.5 text-amber-600" />
                Offers
              </span>
            </NavLink>

            {user?.role === "customer" && (
              <NavLink to="/cart" onClick={() => setMobileOpen(false)} className={mobileLinkClass}>
                <span>Cart</span>
                {itemCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-600 px-1.5 text-[11px] font-semibold text-white">
                    {itemCount}
                  </span>
                )}
              </NavLink>
            )}

            {roleLinks.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={mobileLinkClass}>
                {link.label}
              </NavLink>
            ))}

            <div className="my-1.5 border-t border-stone-100" />

            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-left text-[14px] font-medium text-red-600 hover:bg-red-50"
              >
                <IconLogOut className="w-4 h-4" />
                Log out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[14px] font-medium text-stone-700 hover:bg-stone-50"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="mt-1 rounded-lg bg-stone-900 px-3 py-2.5 text-center text-[14px] font-medium text-white"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;