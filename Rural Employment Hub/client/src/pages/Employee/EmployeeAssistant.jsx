import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import {
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Clock,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

const EmployeeAssistant = () => {
  const { user, apiClient } = useAuth();
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize or update welcome greeting when language changes (if only 1 welcome message exists)
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
    scrollToBottom();
  }, [messages, loading]);

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
      console.error("Chat error:", error);
      toast.error("Failed to reach assistant engine. Please try again.");
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

  return (
    <>
      <Helmet>
        <title>
          {t("graminAiAssistant")} - {t("appName")}
        </title>
      </Helmet>
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-600 via-secondary-500 to-emerald-500 flex items-center justify-center text-white shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {t("graminAiAssistant")}
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold tracking-wider">
                    {t("active247")}
                  </span>
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("assistantTagline")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
              <LanguageSwitcher />

              <button
                onClick={startNewConversation}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-1.5 shadow-xs transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-primary-500" />
                <span>{t("newChat")}</span>
              </button>
            </div>
          </div>

          {/* Chat Container Card */}
          <Card className="flex-1 p-0 flex flex-col border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden min-h-[500px]">
            {/* Message Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-gray-50/50 dark:bg-gray-900/30">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-xs ${
                      msg.role === "user"
                        ? "bg-primary-600"
                        : "bg-gradient-to-tr from-secondary-500 to-primary-500"
                    }`}
                  >
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-primary-600 text-white rounded-tr-none"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <span
                      className={`block text-[10px] mt-1.5 ${
                        msg.role === "user"
                          ? "text-primary-200 text-right"
                          : "text-gray-400 dark:text-gray-500 text-left"
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary-500 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce delay-100" />
                      <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Prompts */}
            <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-2 overflow-x-auto">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:border-primary-400 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap hover:bg-primary-50 dark:hover:bg-primary-900/20 font-medium transition shrink-0"
                >
                  💡 {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t("chatPlaceholder")}
                className="input py-2.5 px-4 text-sm flex-1 font-medium placeholder-gray-400"
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="px-4 py-2.5 shadow-xs font-bold"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </>
  );
};

export default EmployeeAssistant;

