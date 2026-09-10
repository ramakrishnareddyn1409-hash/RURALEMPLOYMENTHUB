import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  full = false,
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) => {
  const baseStyles = "btn";

  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    saffron: "btn-saffron",
    outline: "btn-outline",
    dark: "btn-dark",
    ghost: "btn-ghost",
    danger: "bg-rose-600 hover:bg-rose-700 text-white font-bold focus:ring-rose-500 border border-rose-600/30 shadow-sm",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-xl font-bold",
  };

  const classes = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${
    full ? "w-full" : ""
  } ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center space-x-2">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
