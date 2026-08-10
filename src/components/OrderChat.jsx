// src/components/OrderChat.jsx
import { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import socket from "../api/socket";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";

function IconMessage(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
    </svg>
  );
}
function IconX(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function IconSend(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

const ROLE_LABEL = { customer: "Customer", vendor: "Restaurant", rider: "Delivery partner" };

const ChatAnimStyles = () => (
  <style>{`
    @keyframes chatPanelIn {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes chatBubbleIn {
      from { opacity: 0; transform: translateY(6px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .chat-panel-in { animation: chatPanelIn 0.25s cubic-bezier(0.16,1,0.3,1); }
    .chat-bubble-in { animation: chatBubbleIn 0.2s cubic-bezier(0.16,1,0.3,1); }
  `}</style>
);

function OrderChat({ orderId, isActive, buttonClassName = "" }) {
  const { user } = useAuth();
  const { toast } = useAlert();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [myRole, setMyRole] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bottomRef = useRef(null);

  // poll unread count so the badge shows even when the panel is closed
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await axiosInstance.get(`/messages/order/${orderId}/unread-count`);
        setUnreadCount(res.data.data.unreadCount);
      } catch (err) {
        // silent — non-critical
      }
    };
    fetchUnread();
  }, [orderId]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/messages/order/${orderId}`);
      setMessages(res.data.data.messages);
      setMyRole(res.data.data.myRole);
      setUnreadCount(0); // fetching marks them read server-side
    } catch (err) {
      toast.error("Couldn't load chat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // live incoming messages via the existing order socket room
  useEffect(() => {
    socket.emit("joinOrderRoom", orderId);

    const handleNewMessage = (message) => {
      if (message.order !== orderId && message.order?.toString() !== orderId) return;
      if (open) {
        setMessages((prev) => [...prev, message]);
      } else if (message.sender?._id !== user?.id && message.sender?._id !== user?._id) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await axiosInstance.post(`/messages/order/${orderId}`, { text: text.trim() });
      setMessages((prev) => [...prev, res.data.data.message]);
      setText("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <ChatAnimStyles />
      <button
        onClick={() => setOpen(true)}
        className={
          "relative flex items-center gap-1.5 rounded-full border border-stone-200 px-3.5 py-2 text-[12.5px] font-medium text-stone-700 transition-colors hover:bg-stone-50 " +
          buttonClassName
        }
      >
        <IconMessage className="h-3.5 w-3.5" />
        Chat
        {unreadCount > 0 && (
          <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 sm:items-center">
          <div className="chat-panel-in flex h-[520px] w-full max-w-sm flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3.5">
              <div>
                <p className="text-[14px] font-semibold text-stone-900">
                  {myRole === "customer" ? "Chat with restaurant" : "Chat with customer"}
                </p>
                {!isActive && (
                  <p className="text-[11.5px] text-stone-400">This chat is closed</p>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-full text-stone-400 hover:bg-stone-100"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
              {loading ? (
                <p className="text-center text-[12.5px] text-stone-400">Loading...</p>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="flex items-center justify-center mb-3 rounded-full h-11 w-11 bg-stone-50">
                    <IconMessage className="h-4.5 w-4.5 text-stone-300" />
                  </div>
                  <p className="text-[12.5px] text-stone-400">
                    No messages yet. Say hello!
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderRole === myRole;
                  return (
                    <div
                      key={m._id}
                      className={"chat-bubble-in flex " + (isMine ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={
                          "max-w-[75%] rounded-2xl px-3.5 py-2 text-[13px] " +
                          (isMine
                            ? "rounded-br-sm bg-stone-900 text-white"
                            : "rounded-bl-sm bg-stone-100 text-stone-800")
                        }
                      >
                        {!isMine && (
                          <p className="mb-0.5 text-[10.5px] font-medium text-stone-400">
                            {ROLE_LABEL[m.senderRole] || m.sender?.name}
                          </p>
                        )}
                        <p className="leading-snug">{m.text}</p>
                        <p className={"mt-1 text-[10px] " + (isMine ? "text-white/50" : "text-stone-400")}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {isActive ? (
              <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-stone-100">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  maxLength={500}
                  className="flex-1 rounded-full border border-stone-200 px-4 py-2.5 text-[13px] text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="flex items-center justify-center w-10 h-10 text-white transition-colors rounded-full shrink-0 bg-stone-900 hover:bg-stone-800 disabled:opacity-40"
                >
                  <IconSend className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="border-t border-stone-100 p-4 text-center text-[12.5px] text-stone-400">
                This order is no longer active. Chat has ended.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default OrderChat;