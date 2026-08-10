// // src/pages/Signup.jsx
// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import axiosInstance from "../api/axiosInstance";
// import { useAuth } from "../context/AuthContext";

// function Signup() {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     phone: "",
//     role: "customer",
//   });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const res = await axiosInstance.post("/auth/signup", formData);
//       const { user, token } = res.data.data;
//       login(user, token);
//       navigate("/dashboard");
//     } catch (err) {
//       setError(err.response?.data?.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen px-4 bg-gray-100">
//       <div className="w-full max-w-md p-8 bg-white shadow-md rounded-xl">
//         <h1 className="mb-6 text-2xl font-bold text-center text-orange-600">
//           Create Account
//         </h1>

//         {error && (
//           <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block mb-1 text-sm font-medium text-gray-700">
//               Name
//             </label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//             />
//           </div>

//           <div>
//             <label className="block mb-1 text-sm font-medium text-gray-700">
//               Email
//             </label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//             />
//           </div>

//           <div>
//             <label className="block mb-1 text-sm font-medium text-gray-700">
//               Password
//             </label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               minLength={6}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//             />
//           </div>

//           <div>
//             <label className="block mb-1 text-sm font-medium text-gray-700">
//               Phone
//             </label>
//             <input
//               type="tel"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//             />
//           </div>

//           <div>
//             <label className="block mb-1 text-sm font-medium text-gray-700">
//               Sign up as
//             </label>
//             <select
//               name="role"
//               value={formData.role}
//               onChange={handleChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//             >
//               <option value="customer">Customer</option>
//               <option value="vendor">Restaurant Owner</option>
//               <option value="rider">Delivery Partner</option>
//             </select>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-2 font-medium text-white transition bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50"
//           >
//             {loading ? "Creating account..." : "Sign Up"}
//           </button>
//         </form>

//         <p className="mt-4 text-sm text-center text-gray-600">
//           Already have an account?{" "}
//           <Link to="/login" className="font-medium text-orange-600">
//             Log in
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Signup;




// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import { GoogleLogin } from "@react-oauth/google";

import {
  FiUser,
  FiShoppingBag,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import { LuBike } from "react-icons/lu";

const AnimStyles = () => (
  <style>{`
    @keyframes suFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes suCardIn {
      from { opacity: 0; transform: translateY(16px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes suShake {
      10%, 90% { transform: translateX(-1px); }
      20%, 80% { transform: translateX(2px); }
      30%, 50%, 70% { transform: translateX(-4px); }
      40%, 60% { transform: translateX(4px); }
    }
    .su-fade-up { animation: suFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) backwards; }
    .su-card-in { animation: suCardIn 0.5s cubic-bezier(0.16,1,0.3,1) backwards; }
    .su-shake { animation: suShake 0.5s cubic-bezier(0.36,0.07,0.19,0.97); }
  `}</style>
);

const ROLES = [
  { value: "customer", label: "Customer", icon: FiUser },
  { value: "vendor", label: "Restaurant Owner", icon: FiShoppingBag },
  { value: "rider", label: "Delivery Partner", icon: LuBike },
];

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "customer",
  });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
const [lockedOut, setLockedOut] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useAlert();

  const nameValid = formData.name.trim().length >= 2;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const passwordValid = formData.password.length >= 6;
  const phoneValid = formData.phone === "" || /^[0-9+\-\s()]{7,15}$/.test(formData.phone);

  const showNameError = touched.name && !nameValid;
  const showEmailError = touched.email && !emailValid;
  const showPasswordError = touched.password && !passwordValid;
  const showPhoneError = touched.phone && !phoneValid;

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

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await axiosInstance.post("/auth/signup", formData);
    const { user, token } = res.data.data;
    login(user, token);
    toast.success(`Welcome, ${user.name}!`);
    navigate("/dashboard");
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


  const handleGoogleSuccess = async (credentialResponse) => {
  setError("");
  setLoading(true);
  try {
    const res = await axiosInstance.post("/auth/google", {
      credential: credentialResponse.credential,
      role: formData.role, // uses whichever role card they picked
    });
    const { user, token } = res.data.data;
    login(user, token);
    toast.success(`Welcome, ${user.name}!`);
    navigate("/dashboard");
  } catch (err) {
    setError(err.response?.data?.message || "Google signup failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="relative flex items-center justify-center h-screen px-4 py-4 overflow-hidden bg-white">
      <AnimStyles />

      <div className="su-card-in relative w-full max-w-[420px] overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-24px_rgba(28,20,12,0.12)]">
        <div className="h-1.5 w-full bg-[#EA580C]" />
        <div className="p-6 sm:p-7">
        <div className="mb-5 text-center su-fade-up" style={{ animationDelay: "40ms" }}>
          <h1 className="font-serif text-[23px] font-semibold tracking-tight text-stone-900">
            Create your account
          </h1>
          <p className="mt-1 text-[13px] text-stone-500">
            Join us to start ordering, cooking, or delivering.
          </p>
        </div>

        <div className={shake ? "su-shake" : ""}>
          {error && (
            <div
              className="su-fade-up mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700"
              role="alert"
            >
              <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="su-fade-up" style={{ animationDelay: "60ms" }}>
                <label htmlFor="name" className="mb-1.5 block text-[12.5px] font-semibold text-stone-700">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Jordan Lee"
                  aria-invalid={showNameError}
                  className={[
                    "w-full rounded-xl border bg-white px-3.5 py-2.5 text-[14px] text-stone-900 outline-none transition-all duration-150 placeholder:text-stone-400",
                    showNameError
                      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-stone-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100",
                  ].join(" ")}
                />
                {showNameError && <p className="mt-1.5 text-[12px] text-red-600">Enter your name.</p>}
              </div>

              <div className="su-fade-up" style={{ animationDelay: "80ms" }}>
                <label htmlFor="phone" className="mb-1.5 block text-[12.5px] font-semibold text-stone-700">
                  Phone <span className="font-normal text-stone-400">(optional)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="9876543210"
                  aria-invalid={showPhoneError}
                  className={[
                    "w-full rounded-xl border bg-white px-3.5 py-2.5 text-[14px] text-stone-900 outline-none transition-all duration-150 placeholder:text-stone-400",
                    showPhoneError
                      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-stone-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100",
                  ].join(" ")}
                />
                {showPhoneError && <p className="mt-1.5 text-[12px] text-red-600">Enter a valid number.</p>}
              </div>
            </div>

            <div className="su-fade-up" style={{ animationDelay: "100ms" }}>
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
              {showEmailError && <p className="mt-1.5 text-[12px] text-red-600">Enter a valid email address.</p>}
            </div>

            <div className="su-fade-up" style={{ animationDelay: "120ms" }}>
              <label htmlFor="password" className="mb-1.5 block text-[12.5px] font-semibold text-stone-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="At least 6 characters"
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

            <div className="su-fade-up" style={{ animationDelay: "140ms" }}>
              <label className="mb-1.5 block text-[12.5px] font-semibold text-stone-700">
                Sign up as
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const active = formData.role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r.value })}
                      className={[
                        "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 transition-all duration-150 active:scale-[0.97]",
                        active
                          ? "border-orange-300 bg-orange-50 text-orange-700 shadow-sm"
                          : "border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50",
                      ].join(" ")}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-center text-[10.5px] font-semibold leading-tight">
                        {r.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          <button
  type="submit"
  disabled={loading || lockedOut}
  className="w-full rounded-full bg-stone-900 py-2.5 text-[13.5px] font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
>
  {lockedOut ? "Try again later" : loading ? "Creating account..." : "Sign up"}
</button>
          </form> Times camp le ft me to update le arnch update , times player to appear share storn to rack do ing up time stamp up in the intabase, directly, to field channel s to no brought law machine multiple task website it will a knowledgeable person who is fruit
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

        <p className="su-fade-up mt-4 text-center text-[13px] text-stone-500" style={{ animationDelay: "180ms" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-stone-900 hover:underline">
            Log in
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;