/**
 * EmptyState.jsx — Placeholder for empty content areas
 */

export default function EmptyState({
  title = "Nothing here yet",
  message = "There's no data to display at the moment.",
  icon,
  children,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon || (
        <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      )}
      <h3 className="text-lg font-medium text-gray-300">{title}</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-sm">{message}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
