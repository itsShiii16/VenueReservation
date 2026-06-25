/**
 * PageHeader.jsx — Page header with title and optional actions
 */

export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {/* Action buttons slot */}
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
