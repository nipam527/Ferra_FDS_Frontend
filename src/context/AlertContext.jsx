// src/context/AlertContext.jsx
import { createContext, useContext, useState, useCallback, useRef } from "react";

const AlertContext = createContext();

function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function IconX(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function IconInfo(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}
function IconAlertTriangle(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 9v4M12 17h.01M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}

const TOAST_STYLES = {
  success: {
    icon: IconCheck,
    ring: "ring-emerald-400/40",
    glow: "rgba(16,185,129,0.35)",
    iconBg: "bg-emerald-500/15",
    iconText: "text-emerald-600",
    progress: "#10b981",
  },
  error: {
    icon: IconX,
    ring: "ring-red-400/40",
    glow: "rgba(239,68,68,0.35)",
    iconBg: "bg-red-500/15",
    iconText: "text-red-600",
    progress: "#ef4444",
  },
  info: {
    icon: IconInfo,
    ring: "ring-stone-400/30",
    glow: "rgba(120,113,108,0.25)",
    iconBg: "bg-stone-500/10",
    iconText: "text-stone-600",
    progress: "#78716c",
  },
};

const AlertAnimStyles = () => (
  <style>{`
    @keyframes alertSlideIn {
      0% { opacity: 0; transform: translateY(-14px) scale(0.9); filter: blur(4px); }
      100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
    }
    @keyframes alertSlideOut {
      0% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); max-height: 140px; margin-bottom: 10px; }
      60% { opacity: 0; filter: blur(3px); }
      100% { opacity: 0; transform: translateY(-6px) scale(0.88) translateX(40px); filter: blur(4px); max-height: 0; margin-bottom: 0; }
    }
    @keyframes alertIconPop {
      0% { opacity: 0; transform: scale(0.4) rotate(-16deg); }
      65% { opacity: 1; transform: scale(1.18) rotate(5deg); }
      100% { opacity: 1; transform: scale(1) rotate(0deg); }
    }
    @keyframes alertProgress {
      from { transform: scaleX(1); }
      to { transform: scaleX(0); }
    }
    @keyframes alertPopIn {
      0% { opacity: 0; transform: scale(0.92) translateY(8px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    .alert-slide-in {
      animation: alertSlideIn 0.55s cubic-bezier(0.19,1.2,0.32,1) backwards;
    }
    .alert-slide-out {
      animation: alertSlideOut 0.4s cubic-bezier(0.4,0,1,1) forwards;
    }
    .alert-icon-pop {
      animation: alertIconPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s backwards;
    }
    .alert-progress-track {
      transform-origin: left;
      animation: alertProgress linear forwards;
    }
    .alert-pop-in { animation: alertPopIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
    .alert-toast-stack-item {
      transition: transform 0.35s cubic-bezier(0.19,1,0.22,1), opacity 0.35s ease, filter 0.35s ease;
    }
    .alert-toast-card {
      transition: transform 0.2s cubic-bezier(0.19,1,0.22,1), box-shadow 0.2s ease;
    }
    .alert-toast-card:hover {
      transform: translateY(-2px) scale(1.015);
    }
    .alert-glass {
      background: linear-gradient(180deg, rgba(255,255,255,0.82), rgba(255,255,255,0.68));
      backdrop-filter: blur(20px) saturate(1.8);
      -webkit-backdrop-filter: blur(20px) saturate(1.8);
    }
  `}</style>
);

function Toast({ toast, onDismiss, duration, index, total }) {
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  const Icon = style.icon;

  const fromFront = total - 1 - index;
  const scale = toast.leaving ? 1 : Math.max(1 - fromFront * 0.045, 0.88);
  const translateY = toast.leaving ? 0 : fromFront * -8;
  const opacity = toast.leaving ? 1 : Math.max(1 - fromFront * 0.22, 0.4);

  return (
    <div
      className="pointer-events-auto alert-toast-stack-item"
      style={{
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
        zIndex: index,
      }}
    >
      <div
        className={`alert-glass alert-toast-card ring-1 ${style.ring} relative flex items-start gap-3 overflow-hidden rounded-[20px] px-4 py-3.5 ${
          toast.leaving ? "alert-slide-out" : "alert-slide-in"
        }`}
        style={{
          minWidth: 280,
          maxWidth: 380,
          boxShadow: `0 20px 50px -12px rgba(28,20,12,0.22), 0 0 0 1px rgba(255,255,255,0.5) inset, 0 8px 24px -8px ${style.glow}`,
        }}
      >
        <span
          className={`alert-icon-pop flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.iconBg} ${style.iconText}`}
        >
          <Icon className="w-4 h-4" />
        </span>

        <div className="flex-1 pt-0.5">
          <p className="text-[13px] font-semibold tracking-tight text-stone-900">{toast.message}</p>
          {toast.description && (
            <p className="mt-0.5 text-[12px] leading-snug text-stone-500">{toast.description}</p>
          )}
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="mt-0.5 shrink-0 rounded-full p-1 text-stone-400 transition-colors hover:bg-stone-900/5 hover:text-stone-600"
          aria-label="Dismiss"
        >
          <IconX className="h-3.5 w-3.5" />
        </button>

        {!toast.leaving && duration > 0 && (
          <span className="absolute bottom-0 left-0 h-[2px] w-full bg-stone-900/[0.06]">
            <span
              className="block w-full h-full alert-progress-track"
              style={{ animationDuration: `${duration}ms`, background: style.progress, opacity: 0.55 }}
            />
          </span>
        )}
      </div>
    </div>
  );
}

function ConfirmDialog({ config, onResolve }) {
  if (!config) return null;

  const isDanger = config.variant === "danger";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 px-4 backdrop-blur-[3px]">
      <div className="alert-pop-in alert-glass w-full max-w-sm rounded-[24px] p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] ring-1 ring-white/60">
        <div
          className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            isDanger ? "bg-red-500/15 text-red-500" : "bg-amber-500/15 text-amber-600"
          }`}
        >
          <IconAlertTriangle className="w-5 h-5" />
        </div>
        <h2 className="text-center text-[15px] font-semibold tracking-tight text-stone-900">
          {config.title}
        </h2>
        {config.message && (
          <p className="mt-1.5 text-center text-[13px] text-stone-500">{config.message}</p>
        )}
        <div className="flex gap-2 mt-5">
          <button
            onClick={() => onResolve(false)}
            className="flex-1 rounded-full border border-stone-200/70 bg-white/40 py-2.5 text-[13px] font-medium text-stone-600 transition-colors hover:bg-white/70"
          >
            {config.cancelText || "Cancel"}
          </button>
          <button
            onClick={() => onResolve(true)}
            className={`flex-1 rounded-full py-2.5 text-[13px] font-medium text-white shadow-sm transition-colors ${
              isDanger ? "bg-red-600 hover:bg-red-700" : "bg-stone-900 hover:bg-stone-800"
            }`}
          >
            {config.confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AlertProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const resolveRef = useRef(null);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 400);
  }, []);

  const pushToast = useCallback(
    (type, message, description, duration = 3500) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, type, message, description, duration }]);
      setTimeout(() => dismissToast(id), duration);
    },
    [dismissToast]
  );

  const toast = {
    success: (message, description) => pushToast("success", message, description),
    error: (message, description) => pushToast("error", message, description),
    info: (message, description) => pushToast("info", message, description),
  };

  // returns a Promise<boolean> — true if confirmed, false if cancelled
  const confirm = useCallback((config) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setConfirmConfig(typeof config === "string" ? { title: config } : config);
    });
  }, []);

  const handleResolve = (result) => {
    setConfirmConfig(null);
    resolveRef.current?.(result);
  };

  return (
    <AlertContext.Provider value={{ toast, confirm }}>
      <AlertAnimStyles />
      {children}

      {/* Toast stack */}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col gap-2.5 sm:right-6 sm:top-6">
        {toasts.map((t, i) => (
          <Toast
            key={t.id}
            toast={t}
            duration={t.duration}
            onDismiss={dismissToast}
            index={i}
            total={toasts.length}
          />
        ))}
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog config={confirmConfig} onResolve={handleResolve} />
    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);