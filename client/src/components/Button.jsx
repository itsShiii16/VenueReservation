/**
 * Button.jsx — Reusable button component with variants
 */

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary hover:bg-primary-dark text-white focus:ring-primary",
    secondary: "bg-surface-light hover:bg-surface-lighter text-gray-200 focus:ring-surface-lighter",
    danger: "bg-danger/90 hover:bg-danger text-white focus:ring-danger",
    success: "bg-success/90 hover:bg-success text-white focus:ring-success",
    ghost: "bg-transparent hover:bg-surface-light text-gray-300 focus:ring-surface-lighter",
    outline: "border border-surface-lighter hover:bg-surface-light text-gray-300 focus:ring-surface-lighter",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
