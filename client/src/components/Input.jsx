/**
 * Input.jsx — Reusable text input with label and error state
 */

export default function Input({
  label,
  error,
  id,
  type = "text",
  className = "",
  ...props
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full px-3 py-2 bg-surface-light border rounded-lg text-gray-100 placeholder-gray-500 
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors
          ${error ? "border-danger" : "border-surface-lighter"}`}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
