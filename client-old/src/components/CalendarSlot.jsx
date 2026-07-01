/**
 * CalendarSlot.jsx — Visual time slot for calendar views
 */

export default function CalendarSlot({
  startTime,
  endTime,
  label,
  type = "reservation", // "reservation" | "blocked"
  status,
  onClick,
}) {
  const typeStyles = {
    reservation: "bg-primary/20 border-primary/40 text-primary-light",
    blocked: "bg-danger/20 border-danger/40 text-danger",
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div
      onClick={onClick}
      className={`border-l-3 rounded-r-lg px-3 py-2 cursor-pointer 
        hover:opacity-80 transition-opacity ${typeStyles[type]}`}
    >
      <p className="text-sm font-medium truncate">{label}</p>
      <p className="text-xs opacity-70">
        {formatTime(startTime)} – {formatTime(endTime)}
      </p>
      {status && <p className="text-xs opacity-50 mt-0.5">{status}</p>}
    </div>
  );
}
