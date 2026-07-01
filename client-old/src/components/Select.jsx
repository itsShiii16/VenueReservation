/**
 * Select.jsx — Reusable select dropdown with label
 */

export default function Select({
  label,
  error,
  id,
  options = [],
  placeholder = "Select an option",
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
      <select
        id={id}
        className={`w-full px-3 py-2 bg-surface-light border rounded-lg text-gray-100 
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors
          ${error ? "border-danger" : "border-surface-lighter"}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
