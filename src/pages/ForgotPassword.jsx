// src/pages/ForgotPassword.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

function IconMail(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}
function IconLock(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
function IconEye(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconEyeOff(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.36 5.6C10.2 5.2 11.08 5 12 5c6.5 0 10 7 10 7a13.2 13.2 0 0 1-3.06 3.94M6.5 6.6C4.2 8.1 2 12 2 12a13.2 13.2 0 0 0 5.06 5.4" />
    </svg>
  );
}
function IconAlert(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  );
}
function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function IconArrowLeft(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}
function IconArrowRight(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const ForgotPasswordAnimStyles = () => (
  <style>{`
    .fp-root { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
    .fp-display { font-family: 'Plus Jakarta Sans', 'Inter', ui-sans-serif, system-ui, sans-serif; }
    @keyframes fpFadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fpFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .fp-fade-up { animation: fpFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) backwards; }
    .fp-fade-in { animation: fpFadeIn 0.35s ease backwards; }
    @media (prefers-reduced-motion: reduce) {
      .fp-fade-up, .fp-fade-in { animation: none !important; }
    }
  `}</style>
);

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 120; // seconds

function StepDots({ step }) {
  return (
    <div className="mb-5 flex items-center gap-1.5">
      {[1, 2].map((n) => (
        <span
          key={n}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            n === step ? "w-6 bg-orange-600" : n < step ? "w-6 bg-orange-300" : "w-1.5 bg-stone-200"
          }`}
        />
      ))}
    </div>
  );
}

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = email, 2 = otp + new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [success, setSuccess] = useState(false);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (step === 2) otpRefs.current[0]?.focus();
  }, [step]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Expected backend contract: POST /auth/forgot-password { email }
      // -> 200 if an account exists and an OTP email was sent.
      await axiosInstance.post("/auth/forgot-password", { email });
      setStep(2);
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't send the code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError("");
    setResendLoading(true);
    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      setCooldown(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(""));
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't resend the code.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < OTP_LENGTH - 1) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    text.split("").forEach((d, i) => (next[i] = d));
    setOtp(next);
    otpRefs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  };

  const otpValue = otp.join("");
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (otpValue.length !== OTP_LENGTH) {
      setError("Enter the full 6-digit code.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      // Expected backend contract: POST /auth/reset-password
      // { email, otp, newPassword } -> 200 on success, 400 for invalid/expired code.
      await axiosInstance.post("/auth/reset-password", {
        email,
        otp: otpValue,
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(err.response?.data?.message || "That code didn't work. Check it and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-root flex min-h-screen items-center justify-center bg-white px-4 py-8 sm:px-6">
      <ForgotPasswordAnimStyles />

      <div className="fp-fade-up w-full max-w-sm">
        <Link
          to="/login"
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-500 hover:text-stone-800"
        >
          <IconArrowLeft className="h-4 w-4" />
          Back to log in
        </Link>

        {success ? (
          <div className="fp-fade-in text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <IconCheck className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="fp-display text-[20px] font-extrabold text-stone-900">Password reset</h1>
            <p className="mt-1.5 text-[13.5px] text-stone-500">
              Taking you to log in with your new password…
            </p>
          </div>
        ) : (
          <>
            <StepDots step={step} />
            <p className="fp-display text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">
              {step === 1 ? "Reset password" : "Verify code"}
            </p>
            <h1 className="fp-display mt-1 text-[22px] font-extrabold leading-tight text-stone-900 sm:text-[24px]">
              {step === 1 ? "Forgot your password?" : "Enter the code"}
            </h1>
            <p className="mt-1 text-[13px] text-stone-500">
              {step === 1
                ? "Enter the email on your account and we'll send you a 6-digit code."
                : <>We sent a code to <span className="font-medium text-stone-700">{email}</span>. It expires shortly, so enter it soon.</>}
            </p>

            {error && (
              <div className="fp-fade-in mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-700">
                <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="mt-4 space-y-3" noValidate>
                <div>
                  <label className="mb-1 block text-[12.5px] font-semibold text-stone-700">Email</label>
                  <div className="relative">
                    <IconMail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-11 pr-4 text-[14px] text-stone-900 shadow-sm shadow-stone-900/[0.02] transition-all placeholder:text-stone-400 focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-[14px] font-bold text-white shadow-sm shadow-orange-600/20 transition-all hover:bg-orange-700 hover:shadow-md hover:shadow-orange-600/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Sending code…
                    </>
                  ) : (
                    <>
                      Send code
                      <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleReset} className="mt-4 space-y-4" noValidate>
                <div>
                  <label className="mb-2 block text-[12.5px] font-semibold text-stone-700">Verification code</label>
                  <div className="flex items-center justify-between gap-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="h-12 w-11 rounded-xl border border-stone-200 bg-white text-center text-[18px] font-semibold text-stone-900 shadow-sm shadow-stone-900/[0.02] transition-all focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
                      />
                    ))}
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[12px]">
                    <span className="text-stone-400">
                      {cooldown > 0 ? `Resend available in ${cooldown}s` : "Didn't get it?"}
                    </span>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={cooldown > 0 || resendLoading}
                      className="font-semibold text-orange-600 hover:text-orange-700 disabled:cursor-not-allowed disabled:text-stone-300"
                    >
                      {resendLoading ? "Sending…" : "Resend code"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[12.5px] font-semibold text-stone-700">New password</label>
                  <div className="relative">
                    <IconLock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-stone-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-11 pr-11 text-[14px] text-stone-900 shadow-sm shadow-stone-900/[0.02] transition-all placeholder:text-stone-400 focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded text-stone-400 transition-colors hover:text-stone-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                    >
                      {showPassword ? <IconEyeOff className="h-[18px] w-[18px]" /> : <IconEye className="h-[18px] w-[18px]" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[12.5px] font-semibold text-stone-700">Confirm password</label>
                  <div className="relative">
                    <IconLock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-stone-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="Re-enter password"
                      className={`w-full rounded-xl border bg-white py-2.5 pl-11 pr-4 text-[14px] text-stone-900 shadow-sm shadow-stone-900/[0.02] transition-all placeholder:text-stone-400 focus:outline-none focus:ring-4 ${
                        passwordsMismatch
                          ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                          : "border-stone-200 focus:border-orange-400 focus:ring-orange-100"
                      }`}
                    />
                  </div>
                  {passwordsMismatch && (
                    <p className="mt-1 text-[11.5px] text-red-600">Passwords don't match.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-[14px] font-bold text-white shadow-sm shadow-orange-600/20 transition-all hover:bg-orange-700 hover:shadow-md hover:shadow-orange-600/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Resetting…
                    </>
                  ) : (
                    <>
                      Reset password
                      <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-center text-[12.5px] font-medium text-stone-500 hover:text-stone-800"
                >
                  Wrong email? Go back
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;