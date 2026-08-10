




// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import { FiEye, FiEyeOff, FiAlertCircle, FiLoader } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { GoogleLogin } from "@react-oauth/google";

const AnimStyles = () => (
  <style>{`
    @keyframes liFadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes liCardIn {
      from { opacity: 0; transform: translateY(16px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes liShake {
      10%, 90% { transform: translateX(-1px); }
      20%, 80% { transform: translateX(2px); }
      30%, 50%, 70% { transform: translateX(-4px); }
      40%, 60% { transform: translateX(4px); }
    }
    .li-fade-up { animation: liFadeUp 0.45s cubic-bezier(0.16,1,0.3,1) backwards; }
    .li-card-in { animation: liCardIn 0.55s cubic-bezier(0.16,1,0.3,1) backwards; }
    .li-shake { animation: liShake 0.5s cubic-bezier(0.36,0.07,0.19,0.97); }
  `}</style>
);

// Signature mark, matched to the navbar's wheat-stalk / route-pin logo
function Logomark({ className }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="li-mark" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#C2410C" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="13" fill="#191410" />
      <path d="M20 30V13" stroke="url(#li-mark)" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M20 13c0-3.6 2.4-5.6 5.4-6-.2 3.4-1.8 5.6-5.4 6Z" fill="url(#li-mark)" />
      <path d="M20 13c0-3.6-2.4-5.6-5.4-6 .2 3.4 1.8 5.6 5.4 6Z" fill="url(#li-mark)" opacity="0.55" />
      <path d="M20 18.5c0-3.2 2.1-5 4.8-5.4-.2 3-1.6 5-4.8 5.4Z" fill="url(#li-mark)" opacity="0.85" />
      <path d="M20 18.5c0-3.2-2.1-5-4.8-5.4.2 3 1.6 5 4.8 5.4Z" fill="url(#li-mark)" opacity="0.4" />
      <circle cx="20" cy="30.5" r="2.1" fill="url(#li-mark)" />
    </svg>
  );
}

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [shake, setShake] = useState(false);
const [lockedOut, setLockedOut] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useAlert();

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const passwordValid = formData.password.length >= 6;
  const showEmailError = touched.email && !emailValid;
  const showPasswordError = touched.password && !passwordValid;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
const handleGoogleSuccess = async (credentialResponse) => {
  setError("");
  setLoading(true);
  try {
    const res = await axiosInstance.post("/auth/google", {
      credential: credentialResponse.credential,
    });
    const { user, token } = res.data.data;
    login(user, token);
    toast.success(`Welcome, ${user.name}!`);
    navigate("/dashboard");
  } catch (err) {
    setError(err.response?.data?.message || "Google login failed");
  } finally {
    setLoading(false);
  }
};
  const handleBlur = (e) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await axiosInstance.post("/auth/login", formData);
    const { user, token } = res.data.data;
    login(user, token);
    toast.success(`Welcome back, ${user.name}!`);
    navigate("/");
  } catch (err) {
    if (err.response?.status === 429) {
      setError(err.response.data.message || "Too many attempts. Please wait before trying again.");
      setLockedOut(true);
    } else {
      setError(err.response?.data?.message || "Something went wrong");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="relative flex items-center justify-center h-screen px-4 py-4 overflow-hidden bg-white">
      <AnimStyles />

      <div className="li-card-in relative w-full max-w-[400px] overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-24px_rgba(28,20,12,0.12)]">
        <div className="h-1.5 w-full bg-[#EA580C]" />
        <div className="p-6 sm:p-7">
        <div className="mb-5 text-center li-fade-up" style={{ animationDelay: "40ms" }}>
          <h1 className="font-serif text-[23px] font-semibold tracking-tight text-stone-900">
            Welcome back
          </h1>
          <p className="mt-1 text-[13px] text-stone-500">
            Log in to reorder your favorites and track deliveries.
          </p>
        </div>

        <div className={shake ? "li-shake" : ""}>
          {error && (
            <div
              className="li-fade-up mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700"
              role="alert"
            >
              <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
            <div className="li-fade-up" style={{ animationDelay: "80ms" }}>
              <label htmlFor="email" className="mb-1.5 block text-[12.5px] font-semibold text-stone-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@example.com"
                aria-invalid={showEmailError}
                className={[
                  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-[14px] text-stone-900 outline-none transition-all duration-150 placeholder:text-stone-400",
                  showEmailError
                    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-stone-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100",
                ].join(" ")}
              />
              {showEmailError && (
                <p className="mt-1.5 text-[12px] text-red-600">Enter a valid email address.</p>
              )}
            </div>

            <div className="li-fade-up" style={{ animationDelay: "110ms" }}>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-[12.5px] font-semibold text-stone-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[12px] font-medium text-orange-700 transition-colors hover:text-orange-800 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  aria-invalid={showPasswordError}
                  className={[
                    "w-full rounded-xl border bg-white px-3.5 py-2.5 pr-11 text-[14px] text-stone-900 outline-none transition-all duration-150 placeholder:text-stone-400",
                    showPasswordError
                      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-stone-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100",
                  ].join(" ")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute flex items-center justify-center w-8 h-8 transition-colors -translate-y-1/2 rounded-lg right-1 top-1/2 text-stone-400 hover:bg-stone-50 hover:text-stone-600"
                >
                  {showPassword ? <FiEyeOff className="h-[18px] w-[18px]" /> : <FiEye className="h-[18px] w-[18px]" />}
                </button>
              </div>
              {showPasswordError && (
                <p className="mt-1.5 text-[12px] text-red-600">Password must be at least 6 characters.</p>
              )}
            </div>

            <label className="li-fade-up flex select-none items-center gap-2 text-[13px] text-stone-600" style={{ animationDelay: "130ms" }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded border-stone-300 focus:ring-2 focus:ring-orange-100"
              />
              Keep me logged in
            </label>

            <button
  type="submit"
  disabled={loading || lockedOut}
  className="w-full rounded-full bg-stone-900 py-2.5 text-[13.5px] font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
>
  {lockedOut ? "Try again later" : loading ? "Logging in..." : "Log in"}
</button>
          </form>

          <div className="flex items-center gap-3 mt-4">
  <div className="flex-1 h-px bg-stone-200" />
  <span className="text-[12px] text-stone-400">or</span>
  <div className="flex-1 h-px bg-stone-200" />
</div>

<div className="flex justify-center mt-4">
  <GoogleLogin
    onSuccess={handleGoogleSuccess}
    onError={() => setError("Google login failed")}
    shape="pill"
    theme="outline"
  />
</div>
        </div>

        <p className="li-fade-up mt-5 text-center text-[13px] text-stone-500" style={{ animationDelay: "210ms" }}>
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-stone-900 hover:underline">
            Sign up
          </Link>
        </p>

        <p
          className="li-fade-up mt-3 text-center text-[11px] leading-snug text-stone-400"
          style={{ animationDelay: "230ms" }}
        >
          By continuing, you agree to Farro's{" "}
          <Link to="/terms" className="underline hover:text-stone-600">Terms</Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline hover:text-stone-600">Privacy Policy</Link>.
        </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

