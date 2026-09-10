import React from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const LanguageSwitcher = ({ className = "", compact = false }) => {
  const { language, setLanguage } = useLanguage();

  const options = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "te", label: "తెలుగు", flag: "🇮🇳" },
    { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  ];

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      <Globe className="w-4 h-4 text-primary-500 shrink-0" />
      <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-xl border border-gray-200 dark:border-gray-700">
        {options.map((opt) => (
          <button
            key={opt.code}
            type="button"
            onClick={() => setLanguage(opt.code)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              language === opt.code
                ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-300 shadow-xs font-bold"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
            title={`Switch to ${opt.label}`}
          >
            {compact ? opt.code.toUpperCase() : opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
