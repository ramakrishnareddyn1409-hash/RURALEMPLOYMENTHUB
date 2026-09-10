import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  Bot,
  X,
  Send,
  Sparkles,
  RefreshCw,
  MessageSquare,
  Minimize2,
  Maximize2,
  User,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

const FloatingAssistant = () => {
  const { isAuthenticated, user, apiClient } = useAuth();
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(1);
  const messagesEndRef = useRef(null);

  // Initialize or update welcome greeting when language or user changes
  useEffect(() => {
    const greetingText = t("assistantWelcome").replace(
      "{name}",
      user?.firstName || "Worker"
    );

    setMessages((prev) => {
      if (prev.length === 0 || (prev.length === 1 && prev[0].role === "assistant")) {
        return [
          {
            role: "assistant",
            content: greetingText,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ];
      }
      return prev;
    });
  }, [language, user?.firstName]);

  const quickPrompts = [
    t("promptAttendance"),
    t("promptSalary"),
    t("promptSchemes"),
    t("promptWageCalc"),
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading) return;

    const userMsg = {
      role: "user",
      content: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const payload = {
        message: query,
        language: language,
        ...(conversationId && { conversationID: conversationId }),
      };

      const res = await apiClient.post("/chat/message", payload);
      if (res.data.conversationID && !conversationId) {
        setConversationId(res.data.conversationID);
      }

      const botReply = {
        role: "assistant",
        content:
          res.data.assistantMessage?.message ||
          t("processingQuery") ||
          "I am processing your query.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("Floating Chat error:", error);
      toast.error("Failed to reach assistant engine.");
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = () => {
    setConversationId(null);
    const freshText = t("assistantFreshWelcome").replace(
      "{name}",
      user?.firstName || "Worker"
    );
    setMessages([
      {
        role: "assistant",
        content: freshText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end print:hidden">
      {/* ══════════ FLOATING CHAT POPUP WINDOW ══════════ */}
      {isOpen && (
        <div
          className={`mb-3 w-[92vw] sm:w-[380px] md:w-[410px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col transition-all duration-300 transform origin-bottom-right animate-scaleIn ${
            isMinimized ? "h-14" : "h-[540px] max-h-[82vh]"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 via-secondary-600 to-emerald-600 p-3.5 px-4 text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm leading-tight">
                    {t("graminAiAssistant")}
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <p className="text-[10px] text-white/80 leading-tight">
                  {t("active247")} • AI Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={startNewConversation}
                className="p-1.5 rounded-lg hover:bg-white/20 transition text-white/90"
                title={t("newChat")}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition text-white/90"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? (
                  <Maximize2 className="w-3.5 h-3.5" />
                ) : (
                  <Minimize2 className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition text-white/90"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Language Switcher Bar inside Floating Popup */}
              <div className="bg-gray-50 dark:bg-gray-900/60 px-3 py-2 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                  {t("selectLanguage")}:
                </span>
                <LanguageSwitcher compact={true} />
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-gray-50/40 dark:bg-gray-900/30 text-xs">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 ${
                      msg.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold shadow-xs ${
                        msg.role === "user"
                          ? "bg-primary-600"
                          : "bg-gradient-to-tr from-secondary-500 to-primary-500"
                      }`}
                    >
                      {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    </div>

                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs whitespace-pre-line ${
                        msg.role === "user"
                          ? "bg-primary-600 text-white rounded-tr-none"
                          : "bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span
                        className={`block text-[9px] mt-1 ${
                          msg.role === "user"
                            ? "text-primary-200 text-right"
                            : "text-gray-400 text-left"
                        }`}
                      >
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-secondary-500 text-white flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-none px-3 py-2 shadow-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce delay-100" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="p-2.5 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-1.5 overflow-x-auto">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 hover:border-primary-400 text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap hover:bg-primary-50 dark:hover:bg-primary-900/20 font-medium transition shrink-0"
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-2.5 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t("chatPlaceholder")}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium placeholder-gray-400"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="p-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold transition disabled:opacity-50 shrink-0 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* ══════════ FLOATING LAUNCHER BUTTON (RIGHT SIDE BOTTOM CORNER) ══════════ */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-primary-600 via-secondary-600 to-emerald-600 text-white shadow-2xl hover:shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/30 backdrop-blur-md"
        aria-label="Open Gramin AI Assistant"
      >
        <div className="relative">
          <Bot className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
        </div>

        <div className="text-left hidden sm:block">
          <p className="text-xs font-black tracking-wide leading-tight flex items-center gap-1">
            {t("graminAiAssistant")}
            <Sparkles className="w-3 h-3 text-yellow-300" />
          </p>
          <p className="text-[10px] text-white/85 font-medium leading-tight">
            {t("active247")}
          </p>
        </div>

        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -left-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-md animate-bounce">
            1
          </span>
        )}
      </button>
    </div>
  );
};

export default FloatingAssistant;
