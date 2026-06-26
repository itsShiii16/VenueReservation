import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { venueService } from "../../services/venueService";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/Button";
import LoadingState from "../../components/LoadingState";
import { formatDateTime } from "../../utils/formatDate";
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function CalendarPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [venues, setVenues] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState(searchParams.get("venueId") || "");
  const [venueDetails, setVenueDetails] = useState(null);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // View state: 'day' | 'week' | 'month' (default is 'week' based on screenshot)
  const [viewMode, setViewMode] = useState("week");

  // Calendar time window state.
  const defaultDate = new Date();
  const [currentDate, setCurrentDate] = useState(defaultDate);
  const [selectedSlot, setSelectedSlot] = useState(null); // { date: Date, startTime: string, endTime: string, timeLabel: string }

  // 2-Hour Time Block Configuration
  const timeBlocks = [
    { id: "block1", label: "08:00 AM - 10:00 AM", startHour: 8, startMin: 0, endHour: 10, endMin: 0, gridRow: "1 / span 2" },
    { id: "block2", label: "10:00 AM - 12:00 PM", startHour: 10, startMin: 0, endHour: 12, endMin: 0, gridRow: "3 / span 2" },
    { id: "block3", label: "01:00 PM - 03:00 PM", startHour: 13, startMin: 0, endHour: 15, endMin: 0, gridRow: "6 / span 2" },
    { id: "block4", label: "03:00 PM - 05:00 PM", startHour: 15, startMin: 0, endHour: 17, endMin: 0, gridRow: "8 / span 2" },
  ];

  // Hours for the vertical axis (9 AM to 4 PM, matching visible labels in screenshot)
  const hourLabels = [
    { label: "9 AM", ratio: 1 / 9 },
    { label: "10 AM", ratio: 2 / 9 },
    { label: "11 AM", ratio: 3 / 9 },
    { label: "12 PM", ratio: 4 / 9 },
    { label: "1 PM", ratio: 5 / 9 },
    { label: "2 PM", ratio: 6 / 9 },
    { label: "3 PM", ratio: 7 / 9 },
    { label: "4 PM", ratio: 8 / 9 },
  ];

  // Fetch all venues for fallback selection
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await venueService.getAll();
        setVenues(res.data || []);
        // Auto select first venue if none specified
        if (!selectedVenueId && res.data?.length > 0) {
          setSelectedVenueId(res.data[0].id);
        }
      } catch (err) {
        console.error("Error loading venues:", err);
      } finally {
        setLoadingVenues(false);
      }
    };
    fetchVenues();
  }, []);

  // Fetch specific venue details (blocked slots & reservations)
  useEffect(() => {
    if (!selectedVenueId) return;
    const fetchDetails = async () => {
      setLoadingDetails(true);
      try {
        const res = await venueService.getAvailability(selectedVenueId);
        setVenueDetails(res.data);
      } catch (err) {
        console.error("Error fetching details:", err);
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchDetails();
  }, [selectedVenueId]);

  // Navigate back to the details of the selected venue
  const handleBackToVenue = () => {
    if (selectedVenueId) {
      navigate(`/venues/${selectedVenueId}`);
    } else {
      navigate("/venues");
    }
  };

  // Get start of the week (Sunday) for a given date
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);

  // Generate 7 days of the active week
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(startOfWeek);
    nextDay.setDate(startOfWeek.getDate() + i);
    weekDays.push(nextDay);
  }

  // Format month & year header (e.g. "June 2026")
  const formatMonthYearHeader = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Week navigation helpers
  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
    setSelectedSlot(null);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
    setSelectedSlot(null);
  };

  const handleGoToToday = () => {
    setCurrentDate(defaultDate);
    setSelectedSlot(null);
  };

  // Slot status lookup logic
  const getSlotStatus = (day, block) => {
    const slotDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const todayDate = new Date(defaultDate.getFullYear(), defaultDate.getMonth(), defaultDate.getDate());

    // 1. Check if past date
    if (slotDate < todayDate) {
      return "past";
    }
    // If today, check if the hour block has already passed
    if (slotDate.getTime() === todayDate.getTime()) {
      const currentHour = new Date().getHours();
      if (block.endHour <= currentHour) {
        return "past";
      }
    }

    if (!venueDetails) return "available";

    // 2. Check if blocked
    const hasBlocked = (venueDetails.blockedSlots || []).some((b) => {
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      
      const bDay = new Date(bStart.getFullYear(), bStart.getMonth(), bStart.getDate());
      if (slotDate.getTime() !== bDay.getTime()) return false;

      // Check hour overlap
      return block.startHour < bEnd.getUTCHours() + 8 && block.endHour > bStart.getUTCHours() + 8;
    });
    if (hasBlocked) return "blocked";

    // 3. Check if reserved
    const hasReservation = (venueDetails.reservations || []).some((r) => {
      const rStart = new Date(r.startTime);
      const rEnd = new Date(r.endTime);

      const rDay = new Date(rStart.getFullYear(), rStart.getMonth(), rStart.getDate());
      if (slotDate.getTime() !== rDay.getTime()) return false;

      // Check hour overlap
      return block.startHour < rEnd.getUTCHours() + 8 && block.endHour > rStart.getUTCHours() + 8;
    });
    if (hasReservation) return "reserved";

    return "available";
  };

  const handleSelectSlot = (day, block, status) => {
    if (status !== "available") return;
    
    // Construct local Date string for selection
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, "0");
    const dateNum = String(day.getDate()).padStart(2, "0");
    
    const formattedDate = `${year}-${month}-${dateNum}`;
    
    const startStr = `${formattedDate}T${String(block.startHour).padStart(2, "0")}:${String(block.startMin).padStart(2, "0")}`;
    const endStr = `${formattedDate}T${String(block.endHour).padStart(2, "0")}:${String(block.endMin).padStart(2, "0")}`;

    setSelectedSlot({
      dateStr: day.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      dateISO: formattedDate,
      timeLabel: block.label,
      startTime: startStr,
      endTime: endStr,
    });
  };

  const handleContinue = () => {
    if (!selectedSlot) return;
    
    if (!isAuthenticated) {
      toast.error("Please log in to continue booking this slot.");
      navigate("/login");
      return;
    }
    
    navigate(
      `/reserve?venueId=${selectedVenueId}&date=${selectedSlot.dateISO}&startTime=${selectedSlot.startTime}&endTime=${selectedSlot.endTime}`
    );
  };

  if (loadingVenues || loadingDetails) return <LoadingState message="Loading availability calendar..." />;

  const currentVenueName = venueDetails?.name || "Selected Venue";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top back navigation */}
      <div>
        <button
          onClick={handleBackToVenue}
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-red-800 font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to {currentVenueName}
        </button>
      </div>

      {/* Main Grid View */}
      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Calendar Column */}
        <div className="lg:col-span-3 bg-surface border border-surface-lighter rounded-2xl p-6 shadow-sm space-y-6">
          
          {/* Header Controls (Today, Arrows, Date, Day/Week/Month selector) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            {/* Navigation and Date */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoToToday}
                className="px-4 py-2 border border-surface-lighter bg-surface-light rounded-lg text-sm font-semibold text-gray-100 hover:bg-surface-lighter transition-colors"
              >
                Today
              </button>
              <div className="flex border border-surface-lighter bg-surface-light rounded-lg overflow-hidden">
                <button
                  onClick={handlePrevWeek}
                  className="p-2 text-zinc-400 hover:text-gray-100 hover:bg-surface-lighter border-r border-surface-lighter transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextWeek}
                  className="p-2 text-zinc-400 hover:text-gray-100 hover:bg-surface-lighter transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-gray-100">
                {formatMonthYearHeader(currentDate)}
              </h2>
            </div>

            {/* View Mode Selectors (Segmented Button Layout) */}
            <div className="flex bg-surface-light p-1 rounded-xl border border-surface-lighter">
              {["day", "week", "month"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all
                    ${viewMode === mode
                      ? "bg-surface text-gray-100 shadow-sm"
                      : "text-zinc-400 hover:text-gray-100"}`}
                >
                  {mode}
                </button>
              ))}
            </div>

          </div>

          {viewMode !== "week" ? (
            <div className="py-16 text-center border border-dashed border-surface-lighter rounded-xl bg-surface-light/30">
              <p className="text-zinc-500 text-sm">
                The {viewMode} view mode is a placeholder. Please use the <span className="font-semibold text-red-800">Week</span> view selector for checking and booking time slots.
              </p>
              <Button size="sm" className="mt-4" onClick={() => setViewMode("week")}>
                Switch to Week View
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[700px] space-y-4">
                
                {/* Column Headers (SUN to SAT) */}
                <div className="grid grid-cols-[80px_1fr] border-b border-surface-lighter pb-3 text-center">
                  <div className="w-20"></div> {/* Blank corner for hours axis */}
                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day, idx) => {
                      const isToday = day.toDateString() === defaultDate.toDateString();
                      const weekdayName = day.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
                      const dayNumber = day.getDate();

                      return (
                        <div key={idx} className="space-y-1">
                          <span className={`text-xs font-bold block tracking-wider ${isToday ? "text-red-800" : "text-zinc-400"}`}>
                            {weekdayName}
                          </span>
                          {isToday ? (
                            <span className="w-8 h-8 rounded-full bg-red-800 text-white font-bold flex items-center justify-center mx-auto shadow-sm">
                              {dayNumber}
                            </span>
                          ) : (
                            <span className="text-base font-semibold text-gray-100 block py-1">
                              {dayNumber}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scrollable Container for Grid and Time Axis */}
                <div className="max-h-[440px] overflow-y-auto pr-2 border border-surface-lighter/40 rounded-xl relative bg-white">
                  <div className="grid grid-cols-[80px_1fr] relative py-4">
                    
                    {/* Left Hour labels column */}
                    <div className="relative h-[432px]">
                      {hourLabels.map((lbl) => (
                        <div
                          key={lbl.label}
                          className="absolute right-3 text-xs text-zinc-400 font-semibold -translate-y-1/2"
                          style={{ top: `${lbl.ratio * 100}%` }}
                        >
                          {lbl.label}
                        </div>
                      ))}
                    </div>

                    {/* 7 Columns Grid representing slots */}
                    <div className="grid grid-cols-7 gap-2 h-[432px] grid-rows-9 relative">
                      
                      {/* Vertical grid lines helper */}
                      <div className="absolute inset-0 grid grid-cols-7 pointer-events-none opacity-10 divide-x divide-surface-lighter" />
                      
                      {/* Horizontal grid lines helper */}
                      <div className="absolute inset-0 grid grid-rows-9 pointer-events-none opacity-10 divide-y divide-surface-lighter" />

                    {/* Time Slot Blocks rendering */}
                    {timeBlocks.map((block) => {
                      return weekDays.map((day, colIndex) => {
                        const status = getSlotStatus(day, block);
                        const isSelected = selectedSlot && 
                          selectedSlot.dateISO === day.toISOString().split("T")[0] && 
                          selectedSlot.timeLabel === block.label;

                        // Conditional class names matching the screenshot styling exactly
                        let cellStyles = "";
                        if (status === "past") {
                          cellStyles = "bg-zinc-50 border-zinc-100 text-zinc-400 cursor-not-allowed";
                        } else if (status === "blocked" || status === "reserved") {
                          cellStyles = "bg-red-50/50 border-red-100 text-red-500 cursor-not-allowed";
                        } else if (isSelected) {
                          cellStyles = "bg-red-900/10 border-red-800 text-red-800 ring-2 ring-red-800/20 shadow-sm cursor-pointer";
                        } else {
                          cellStyles = "bg-green-50/80 border-green-200 text-green-800 hover:bg-green-50 cursor-pointer hover:shadow-sm";
                        }

                        return (
                          <div
                            key={`${block.id}-${colIndex}`}
                            onClick={() => handleSelectSlot(day, block, status)}
                            className={`border rounded-xl p-2.5 flex flex-col justify-center items-center text-center text-xs font-semibold transition-all select-none ${cellStyles}`}
                            style={{
                              gridColumn: colIndex + 1,
                              gridRow: block.gridRow,
                            }}
                          >
                            <span className="block text-[10px] sm:text-xs tracking-tight font-medium opacity-90 leading-tight">
                              {block.label.split(" - ")[0]} -
                            </span>
                            <span className="block text-[10px] sm:text-xs tracking-tight font-medium opacity-90 leading-tight">
                              {block.label.split(" - ")[1]}
                            </span>
                            
                            <span className="mt-1 flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold">
                              <span className={`w-1.5 h-1.5 rounded-full 
                                ${status === "past" ? "bg-zinc-300" :
                                  status === "available" ? "bg-green-500 animate-pulse" :
                                  "bg-red-500"}`}
                              />
                              <span className="capitalize">
                                {status === "past" ? "Past" : 
                                 status === "available" ? "Available" : 
                                 status === "blocked" ? "Blocked" : "Reserved"}
                              </span>
                            </span>
                          </div>
                        );
                      });
                    })}

                  </div>

                </div>

              </div>
            </div>
          </div>
          )}

        </div>

        {/* Sidebar Info Column */}
        <div className="bg-surface border border-surface-lighter rounded-2xl p-6 shadow-sm flex flex-col justify-between h-fit min-h-[440px]">
          
          <div className="space-y-5">
            <div className="flex items-center gap-2 border-b border-surface-lighter pb-4">
              <Calendar className="w-5 h-5 text-red-800" />
              <h3 className="text-base font-bold text-gray-100">
                Reservation Details
              </h3>
            </div>

            {/* Gray Detail Card Container */}
            <div className="bg-surface-light border border-surface-lighter rounded-xl p-4 space-y-4">
              
              {/* Venue Row */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Venue</span>
                </div>
                <span className="font-bold text-gray-100 block text-sm pl-5">
                  {currentVenueName}
                </span>
              </div>
              
              <div className="border-t border-surface-lighter" />
              
              {/* Date Row */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Date</span>
                </div>
                <span className={`block text-sm pl-5 ${selectedSlot ? "font-bold text-gray-100" : "text-zinc-400 italic"}`}>
                  {selectedSlot ? selectedSlot.dateStr : "Not selected"}
                </span>
              </div>

              <div className="border-t border-surface-lighter" />
              
              {/* Time Row */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Time</span>
                </div>
                <span className={`block text-sm pl-5 ${selectedSlot ? "font-bold text-gray-100" : "text-zinc-400 italic"}`}>
                  {selectedSlot ? selectedSlot.timeLabel : "Not selected"}
                </span>
              </div>

            </div>
          </div>

          <div className="pt-6 mt-6">
            <Button
              className="w-full bg-red-800 hover:bg-red-900 text-white border-0"
              disabled={!selectedSlot}
              onClick={handleContinue}
            >
              Continue to Form
            </Button>
          </div>

        </div>

      </div>

    </div>
  );
}
