// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import { FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import { GoogleLogin } from "@react-oauth/google";

/* ------------------------------------------------------------------------ */
/*  Palette — matches Navbar.jsx / Restaurants.jsx exactly.                 */
/*    ink        #1B1712      paper      #FFFFFF     line       #ECE7DD    */
/*    marigold   #D98A2B      marigold-d #B96F1A      olive     #4B5D45    */
/*    muted      #6B6355      faint      #A69C8C      wash      #F7F5EF    */
/* ------------------------------------------------------------------------ */

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

// Same fork/"F" mark used in Navbar.jsx, unchanged so branding stays identical.
function Logomark({ className }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="12" fill="#1B1712" />
      <path
        d="M13 10v7.5c0 1.5 1 2.5 2.3 2.7V30a1.3 1.3 0 0 0 2.6 0v-9.8c1.3-.2 2.3-1.2 2.3-2.7V10a1 1 0 0 0-2 0v6a.8.8 0 0 1-1.6 0v-6a1 1 0 0 0-2 0v6a.8.8 0 0 1-1.6 0v-6a1 1 0 0 0-2 0Z"
        fill="#D98A2B"
      />
      <path
        d="M25.5 10c-2.2 0-4 2.3-4 5.4 0 2.2.9 4.1 2.3 4.9v9.4a1.3 1.3 0 0 0 2.6 0v-9.4c1.4-.8 2.3-2.7 2.3-4.9 0-3.1-1.8-5.4-4-5.4Z"
        fill="#D98A2B"
        opacity="0.55"
      />
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

  const handleBlur = (e) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
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
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!emailValid || !passwordValid) {
      setTouched({ email: true, password: true });
      triggerShake();
      return;
    }

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
        setError(err.response?.data?.message || "Invalid email or password. Please try again.");
      }
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center w-full min-h-screen px-4 py-8 overflow-hidden bg-white">
      <AnimStyles />

      {/* faint ambient wash, echoes the warm-white canvas used across the app */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          background:
            "radial-gradient(circle at 15% 10%, #F7F5EF 0%, transparent 45%), radial-gradient(circle at 85% 90%, #F7F5EF 0%, transparent 45%)",
        }}
      />

      <div
        className="li-card-in relative w-full max-w-[400px] overflow-hidden rounded-3xl border shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-24px_rgba(27,23,18,0.14)]"
        style={{ borderColor: "#ECE7DD", backgroundColor: "#FFFFFF" }}
      >
        <div className="h-1.5 w-full" style={{ backgroundColor: "#D98A2B" }} />
        <div className="p-6 sm:p-7">
          {/* Brand mark, matched to Navbar.jsx */}
          <div className="flex flex-col items-center mb-5 text-center li-fade-up" style={{ animationDelay: "0ms" }}>
            <Link to="/" className="flex items-center gap-2.5 group">
              <Logomark className="transition-transform duration-300 ease-out h-9 w-9 group-hover:-rotate-3" />
              <span className="font-serif text-[19px] font-medium tracking-tight" style={{ color: "#1B1712" }}>
                Farro<span style={{ color: "#D98A2B" }}>.</span>
              </span>
            </Link>
          </div>

          <div className="mb-5 text-center li-fade-up" style={{ animationDelay: "40ms" }}>
            <h1 className="font-serif text-[23px] font-semibold tracking-tight" style={{ color: "#1B1712" }}>
              Welcome back
            </h1>
            <p className="mt-1 text-[13px]" style={{ color: "#6B6355" }}>
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
                <label htmlFor="email" className="mb-1.5 block text-[12.5px] font-semibold" style={{ color: "#3A322A" }}>
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
                  className="w-full rounded-xl border bg-white px-3.5 py-2.5 text-[14px] outline-none transition-all duration-150"
                  style={{
                    color: "#1B1712",
                    borderColor: showEmailError ? "#FCA5A5" : "#ECE7DD",
                    boxShadow: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = showEmailError ? "#F87171" : "#D98A2B";
                    e.target.style.boxShadow = showEmailError
                      ? "0 0 0 3px rgba(248,113,113,0.15)"
                      : "0 0 0 3px rgba(217,138,43,0.15)";
                  }}
                  onBlurCapture={(e) => {
                    e.target.style.boxShadow = "none";
                  }}
                />
                {showEmailError && (
                  <p className="mt-1.5 text-[12px] text-red-600">Enter a valid email address.</p>
                )}
              </div>

              <div className="li-fade-up" style={{ animationDelay: "110ms" }}>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="block text-[12.5px] font-semibold" style={{ color: "#3A322A" }}>
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[12px] font-medium transition-colors hover:underline"
                    style={{ color: "#B96F1A" }}
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
                    className="w-full rounded-xl border bg-white px-3.5 py-2.5 pr-11 text-[14px] outline-none transition-all duration-150"
                    style={{
                      color: "#1B1712",
                      borderColor: showPasswordError ? "#FCA5A5" : "#ECE7DD",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = showPasswordError ? "#F87171" : "#D98A2B";
                      e.target.style.boxShadow = showPasswordError
                        ? "0 0 0 3px rgba(248,113,113,0.15)"
                        : "0 0 0 3px rgba(217,138,43,0.15)";
                    }}
                    onBlurCapture={(e) => {
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute flex items-center justify-center w-8 h-8 transition-colors -translate-y-1/2 rounded-lg right-1 top-1/2 hover:bg-[#F7F5EF]"
                    style={{ color: "#A69C8C" }}
                  >
                    {showPassword ? <FiEyeOff className="h-[18px] w-[18px]" /> : <FiEye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
                {showPasswordError && (
                  <p className="mt-1.5 text-[12px] text-red-600">Password must be at least 6 characters.</p>
                )}
              </div>

              <label
                className="li-fade-up flex select-none items-center gap-2 text-[13px]"
                style={{ animationDelay: "130ms", color: "#6B6355" }}
              >
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: "#D98A2B", borderColor: "#ECE7DD" }}
                />
                Keep me logged in
              </label>

              <button
                type="submit"
                disabled={loading || lockedOut}
                className="li-fade-up w-full rounded-full py-2.5 text-[13.5px] font-medium text-white transition-colors disabled:opacity-50"
                style={{ animationDelay: "150ms", backgroundColor: "#1B1712" }}
                onMouseEnter={(e) => {
                  if (!loading && !lockedOut) e.currentTarget.style.backgroundColor = "#D98A2B";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#1B1712";
                }}
              >
                {lockedOut ? "Try again later" : loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <div className="flex items-center gap-3 mt-4 li-fade-up" style={{ animationDelay: "170ms" }}>
              <div className="flex-1 h-px" style={{ backgroundColor: "#ECE7DD" }} />
              <span className="text-[12px]" style={{ color: "#A69C8C" }}>or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "#ECE7DD" }} />
            </div>

            <div className="flex justify-center mt-4 li-fade-up" style={{ animationDelay: "190ms" }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google login failed")}
                shape="pill"
                theme="outline"
                width="340"
              />
            </div>
          </div>

          <p className="li-fade-up mt-5 text-center text-[13px]" style={{ animationDelay: "210ms", color: "#6B6355" }}>
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold hover:underline" style={{ color: "#1B1712" }}>
              Sign up
            </Link>
          </p>

          <p
            className="li-fade-up mt-3 text-center text-[11px] leading-snug"
            style={{ animationDelay: "230ms", color: "#A69C8C" }}
          >
            By continuing, you agree to Farro's{" "}
            <Link to="/terms" className="underline hover:text-[#6B6355]">Terms</Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline hover:text-[#6B6355]">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;