/**
 * Textarea.jsx — Reusable textarea with label
 */

export default function Textarea({
  label,
  error,
  id,
  rows = 4,
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
      <textarea
        id={id}
        rows={rows}
        className={`w-full px-3 py-2 bg-surface-light border rounded-lg text-gray-100 placeholder-gray-500 
          resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors
          ${error ? "border-danger" : "border-surface-lighter"}`}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
