/**
 * LoadingState.jsx — Full-area loading spinner
 */

export default function LoadingState({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-surface-lighter rounded-full animate-spin border-t-primary" />
      </div>
      <p className="text-sm text-gray-400 mt-4">{message}</p>
    </div>
  );
}
