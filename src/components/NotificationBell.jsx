// src/components/NotificationBell.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";


function IconBell(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}
function IconBag(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8h12l-1 12.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20.5L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
function IconTruck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="1" y="7" width="14" height="10" rx="1.2" />
      <path d="M15 10h4l3 3v4h-7z" />
      <circle cx="6" cy="19" r="1.6" /><circle cx="17.5" cy="19" r="1.6" />
    </svg>
  );
}
function IconStar(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.5 15 9l7 .9-5.1 4.8L18.2 21 12 17.4 5.8 21l1.3-6.3L2 9.9 9 9l3-6.5Z" />
    </svg>
  );
}
function IconTag(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.6 12.6 12.7 20.5a2 2 0 0 1-2.83 0L3.5 14.13a2 2 0 0 1 0-2.83L11.4 3.4A2 2 0 0 1 12.8 2.8L20 3l.2 7.2a2 2 0 0 1-.6 2.4Z" />
      <circle cx="16" cy="7" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconInfo(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}
function IconCheckDouble(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m2 12 4 4 8-8" />
      <path d="m10 12 4 4 8-8" />
    </svg>
  );
}

const TYPE_STYLE = {
  new_order: { icon: IconBag, bg: "bg-amber-50", text: "text-amber-600" },
  order_status: { icon: IconTruck, bg: "bg-blue-50", text: "text-blue-600" },
  review: { icon: IconStar, bg: "bg-violet-50", text: "text-violet-600" },
  coupon: { icon: IconTag, bg: "bg-green-50", text: "text-green-600" },
  system: { icon: IconInfo, bg: "bg-stone-100", text: "text-stone-500" },
};

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return mins + "m";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h";
  const days = Math.floor(hrs / 24);
  if (days < 7) return days + "d";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const AnimStyles = () => (
  <style>{`
    @keyframes nbPanelIn {
      from { opacity: 0; transform: translateY(-6px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes nbRing {
      0%, 100% { box-shadow: 0 0 0 0 rgba(217,119,6,0.35); }
      50% { box-shadow: 0 0 0 4px rgba(217,119,6,0); }
    }
    .nb-panel-in { animation: nbPanelIn 0.18s cubic-bezier(0.16,1,0.3,1); transform-origin: top right; }
    .nb-ring { animation: nbRing 2s ease-out infinite; }
  `}</style>
);

function NotificationItem({ n, onClick }) {
  const style = TYPE_STYLE[n.type] || TYPE_STYLE.system;
  const Icon = style.icon;

  return (
    <button
      onClick={() => onClick(n)}
      className="relative flex items-start w-full gap-3 px-4 py-3 text-left transition-colors group hover:bg-stone-50"
    >
      {!n.isRead && (
        <span className="absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-amber-500" />
      )}
      <span className={"mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full " + style.bg + " " + style.text}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="flex-1 min-w-0">
        <p className={"truncate text-[13px] leading-snug " + (n.isRead ? "font-medium text-stone-700" : "font-semibold text-stone-900")}>
          {n.title}
        </p>
        <p className="mt-0.5 truncate text-[12px] text-stone-500">{n.message}</p>
      </div>
      <span className="mt-0.5 shrink-0 text-[11px] text-stone-400">{timeAgo(n.createdAt)}</span>
    </button>
  );
}

function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleItemClick = (n) => {
    if (!n.isRead) markAsRead(n._id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  // group into "New" (unread) and "Earlier" (read) sections
  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  return (
    <div className="relative" ref={ref}>
      <AnimStyles />
      <button
        onClick={() => setOpen((v) => !v)}
        className={
          "relative flex h-9 w-9 items-center justify-center rounded-full transition-colors " +
          (open ? "bg-stone-100 text-stone-800" : "text-stone-500 hover:bg-stone-100 hover:text-stone-800")
        }
        aria-label="Notifications"
      >
        <IconBell className={"h-[18px] w-[18px] " + (unreadCount > 0 ? "nb-ring rounded-full" : "")} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-[3px] text-[9.5px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="nb-panel-in absolute right-0 z-50 mt-2.5 w-[336px] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl shadow-stone-900/[0.1]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-semibold text-stone-900">Notifications</p>
              {unreadCount > 0 && (
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10.5px] font-semibold text-amber-700">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[11.5px] font-medium text-stone-500 transition-colors hover:text-amber-700"
              >
                <IconCheckDouble className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[26rem] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-stone-50">
                  <IconBell className="w-5 h-5 text-stone-300" />
                </div>
                <p className="text-[13px] font-medium text-stone-600">You're all caught up</p>
                <p className="mt-0.5 text-[12px] text-stone-400">New notifications will show up here</p>
              </div>
            ) : (
              <>
                {unread.length > 0 && (
                  <div>
                    <p className="px-4 pb-1 pt-3 text-[10.5px] font-semibold uppercase tracking-wide text-stone-400">
                      New
                    </p>
                    <div className="divide-y divide-stone-50">
                      {unread.map((n) => (
                        <NotificationItem key={n._id} n={n} onClick={handleItemClick} />
                      ))}
                    </div>
                  </div>
                )}
                {read.length > 0 && (
                  <div>
                    <p className="px-4 pb-1 pt-3 text-[10.5px] font-semibold uppercase tracking-wide text-stone-400">
                      Earlier
                    </p>
                    <div className="divide-y divide-stone-50">
                      {read.map((n) => (
                        <NotificationItem key={n._id} n={n} onClick={handleItemClick} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-stone-100 px-4 py-2.5 text-center">
              <p className="text-[11.5px] text-stone-400">Showing latest {notifications.length}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;