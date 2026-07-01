/**
 * ReservationFormPage.jsx — Submit a new reservation with interactive availability calendar
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { reservationService } from "../../services/reservationService";
import { venueService } from "../../services/venueService";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Textarea from "../../components/Textarea";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";
import LoadingState from "../../components/LoadingState";
import { formatDateTime, formatDate } from "../../utils/formatDate";
import { Plus, Trash2, ChevronLeft, ChevronRight, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ReservationFormPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [venueDetails, setVenueDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");

  const prefilledVenueId = searchParams.get("venueId") || "";
  const prefilledDate = searchParams.get("date") || "";
  const prefilledStartTime = searchParams.get("startTime") || "";
  const prefilledEndTime = searchParams.get("endTime") || "";

  // Set the calendar's current viewing date to prefilled date if available, or today
  const defaultDate = new Date();
  const [currentDate, setCurrentDate] = useState(() => {
    if (prefilledDate) {
      const parsed = new Date(prefilledDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return defaultDate;
  });

  const [formData, setFormData] = useState({
    venueId: prefilledVenueId,
    eventTitle: "",
    expectedAttendees: "",
    notes: "",
  });

  const [slots, setSlots] = useState(() => {
    if (prefilledStartTime && prefilledEndTime) {
      return [{ startTime: prefilledStartTime, endTime: prefilledEndTime }];
    }
    return [];
  });

  const selectedVenue = venues.find((v) => v.id === formData.venueId);

  // Time blocks mapping (matches the main CalendarPage)
  const timeBlocks = [
    { id: "block1", label: "08:00 AM - 10:00 AM", startHour: 8, startMin: 0, endHour: 10, endMin: 0, gridRow: "1 / span 2" },
    { id: "block2", label: "10:00 AM - 12:00 PM", startHour: 10, startMin: 0, endHour: 12, endMin: 0, gridRow: "3 / span 2" },
    { id: "block3", label: "01:00 PM - 03:00 PM", startHour: 13, startMin: 0, endHour: 15, endMin: 0, gridRow: "6 / span 2" },
    { id: "block4", label: "03:00 PM - 05:00 PM", startHour: 15, startMin: 0, endHour: 17, endMin: 0, gridRow: "8 / span 2" },
  ];

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

  // Fetch all venues
  useEffect(() => {
    venueService.getAll()
      .then((res) => {
        setVenues(res.data || []);
        if (!formData.venueId && res.data?.length > 0) {
          setFormData((prev) => ({ ...prev, venueId: res.data[0].id }));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch specific venue details (blocked slots & reservations)
  useEffect(() => {
    if (!formData.venueId) {
      setVenueDetails(null);
      return;
    }
    setLoadingDetails(true);
    venueService.getAvailability(formData.venueId)
      .then((res) => {
        setVenueDetails(res.data);
      })
      .catch((err) => {
        console.error("Error loading availability:", err);
      })
      .finally(() => {
        setLoadingDetails(false);
      });
  }, [formData.venueId]);

  // Calendar helpers
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(startOfWeek);
    nextDay.setDate(startOfWeek.getDate() + i);
    weekDays.push(nextDay);
  }

  const formatMonthYearHeader = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleGoToToday = () => {
    setCurrentDate(defaultDate);
  };

  const getSlotStatus = (day, block) => {
    const slotDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    // 1. Check if past date
    const compareDate = new Date(slotDate);
    compareDate.setHours(0, 0, 0, 0);
    
    if (compareDate < todayDate) {
      return "past";
    }
    
    // Check if the hour block has already passed for today
    if (compareDate.getTime() === todayDate.getTime()) {
      const currentHour = new Date().getHours();
      if (block.endHour <= currentHour) {
        return "past";
      }
    }

    if (!venueDetails) return "available";

    // Check date configuration override
    const dateStr = day.toISOString().split("T")[0];
    const config = (venueDetails.dateConfigs || []).find((c) => {
      const cStr = new Date(c.date).toISOString().split("T")[0];
      return cStr === dateStr;
    });

    if (config) {
      if (config.isClosed) {
        return "blocked";
      }
      if (config.openTime && config.closeTime) {
        const [openH, openM] = config.openTime.split(":").map(Number);
        const [closeH, closeM] = config.closeTime.split(":").map(Number);
        const blockStart = block.startHour + block.startMin / 60;
        const blockEnd = block.endHour + block.endMin / 60;
        const openVal = openH + openM / 60;
        const closeVal = closeH + closeM / 60;
        if (blockStart < openVal || blockEnd > closeVal) {
          return "blocked";
        }
      }
    } else {
      // Check default operating hours
      const defaultOpen = venueDetails.defaultOpenTime || "08:00";
      const defaultClose = venueDetails.defaultCloseTime || "17:00";
      const [openH, openM] = defaultOpen.split(":").map(Number);
      const [closeH, closeM] = defaultClose.split(":").map(Number);
      const blockStart = block.startHour + block.startMin / 60;
      const blockEnd = block.endHour + block.endMin / 60;
      const openVal = openH + openM / 60;
      const closeVal = closeH + closeM / 60;
      if (blockStart < openVal || blockEnd > closeVal) {
        return "blocked";
      }
    }

    // 2. Check if blocked
    const hasBlocked = (venueDetails.blockedSlots || []).some((b) => {
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      
      const bDay = new Date(bStart.getFullYear(), bStart.getMonth(), bStart.getDate());
      if (slotDate.getTime() !== bDay.getTime()) return false;

      return block.startHour < bEnd.getUTCHours() + 8 && block.endHour > bStart.getUTCHours() + 8;
    });
    if (hasBlocked) return "blocked";

    // 3. Check if reserved
    const hasReservation = (venueDetails.reservations || []).some((r) => {
      const checkOverlap = (startTime, endTime) => {
        const rStart = new Date(startTime);
        const rEnd = new Date(endTime);
        const rDay = new Date(rStart.getFullYear(), rStart.getMonth(), rStart.getDate());
        if (slotDate.getTime() !== rDay.getTime()) return false;
        return block.startHour < rEnd.getUTCHours() + 8 && block.endHour > rStart.getUTCHours() + 8;
      };

      if (r.slots && Array.isArray(r.slots) && r.slots.length > 0) {
        return r.slots.some(slot => checkOverlap(slot.startTime, slot.endTime));
      }
      return checkOverlap(r.startTime, r.endTime);
    });
    if (hasReservation) return "reserved";

    return "available";
  };

  const handleSelectSlot = (day, block, status) => {
    if (status !== "available") return;

    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, "0");
    const dateNum = String(day.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${dateNum}`;
    
    const startStr = `${formattedDate}T${String(block.startHour).padStart(2, "0")}:${String(block.startMin).padStart(2, "0")}`;
    const endStr = `${formattedDate}T${String(block.endHour).padStart(2, "0")}:${String(block.endMin).padStart(2, "0")}`;

    setSlots((prev) => {
      const exists = prev.some(s => s.startTime === startStr && s.endTime === endStr);
      if (exists) {
        // Toggle off
        return prev.filter(s => !(s.startTime === startStr && s.endTime === endStr));
      } else {
        // Toggle on
        return [...prev, { startTime: startStr, endTime: endStr }];
      }
    });
  };

  const getSlotLabel = (startTime, endTime) => {
    const sDate = new Date(startTime);
    const eDate = new Date(endTime);
    const dateStr = sDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const formatTimePart = (d) => {
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
    };
    return `${dateStr} @ ${formatTimePart(sDate)} - ${formatTimePart(eDate)}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (slots.length === 0) {
      setError("Please select at least one time slot on the calendar.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await reservationService.create({
        ...formData,
        startTime: slots[0].startTime,
        endTime: slots[0].endTime,
        slots,
      });
      navigate("/my-reservations");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit reservation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="New Reservation"
        subtitle="Fill in details and click on available time slots in the calendar grid to build your booking timeline"
      />

      <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
        
        {/* Left Column: Form Details & Selected Slots */}
        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-surface-lighter rounded-2xl p-6 shadow-sm space-y-6"
        >
          <h2 className="text-base font-bold text-gray-100 border-b border-surface-lighter pb-3">Booking Details</h2>
          
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger text-xs rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Select
            id="venueId"
            label="Select Venue"
            name="venueId"
            value={formData.venueId}
            onChange={handleChange}
            options={venues.map((v) => ({ value: v.id, label: v.name }))}
            placeholder="Select a venue"
            required
          />

          <Input 
            id="eventTitle" 
            label="Event Title" 
            name="eventTitle" 
            placeholder="e.g. Org Assembly, Colloquium" 
            value={formData.eventTitle} 
            onChange={handleChange} 
            required 
          />

          <Input 
            id="expectedAttendees" 
            label="Expected Attendees" 
            name="expectedAttendees" 
            type="number" 
            min="1" 
            placeholder="e.g. 50" 
            value={formData.expectedAttendees} 
            onChange={handleChange} 
            required 
          />

          {/* Selected Slots list */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-400">Selected Slots</label>
            {slots.length === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-amber-50/50 border border-amber-250/65 text-amber-800 text-xs rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>No slots chosen. Select green availability blocks on the calendar.</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {slots.map((slot, index) => {
                  const label = getSlotLabel(slot.startTime, slot.endTime);
                  return (
                    <div key={index} className="flex justify-between items-center bg-surface-light border border-surface-lighter px-3 py-2.5 rounded-xl text-[11px] animate-in fade-in slide-in-from-top-1 duration-100">
                      <span className="font-semibold text-gray-100 leading-tight">{label}</span>
                      <button
                        type="button"
                        onClick={() => setSlots(prev => prev.filter((_, i) => i !== index))}
                        className="p-1.5 hover:bg-danger/10 text-danger rounded-lg transition-colors border border-transparent hover:border-danger/10"
                        title="Remove Slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Textarea 
            id="notes" 
            label="Additional Notes (optional)" 
            name="notes" 
            placeholder="Describe setup requests..." 
            value={formData.notes} 
            onChange={handleChange} 
            rows={2} 
          />

          {selectedVenue && (
            <div className={`p-4 border rounded-xl text-xs leading-relaxed ${(selectedVenue.allowsPencilBooking || selectedVenue.allowPencilBooking) ? "bg-red-50/50 border-red-250 text-zinc-700" : "bg-zinc-50 border-zinc-250 text-zinc-700"}`}>
              <span className="block text-zinc-900 font-bold mb-1">
                {(selectedVenue.allowsPencilBooking || selectedVenue.allowPencilBooking) ? "Preliminary Pencil Flow Active" : "Direct Review Flow Active"}
              </span>
              {(selectedVenue.allowsPencilBooking || selectedVenue.allowPencilBooking) 
                ? "This venue allows pencil booking. Your request holds slots pending Manager approval to begin the payment period."
                : "Submit requirements immediately. The Venue Manager reviews and confirms upon document validation."
              }
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-surface-lighter">
            <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={slots.length === 0}>
              Submit Reservation
            </Button>
          </div>
        </form>

        {/* Right Column: Availability Calendar */}
        <div>
          {loadingDetails ? (
            <div className="flex flex-col items-center justify-center h-[520px] bg-surface border border-surface-lighter rounded-2xl shadow-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-zinc-500 text-sm">Loading availability schedule...</p>
            </div>
          ) : !venueDetails ? (
            <div className="flex flex-col items-center justify-center h-[520px] bg-surface border border-surface-lighter rounded-2xl shadow-sm text-center p-6">
              <Calendar className="w-12 h-12 text-zinc-300 mb-3" />
              <h3 className="text-base font-bold text-gray-100">No Venue Selected</h3>
              <p className="text-sm text-zinc-500 max-w-xs mt-1">Select a venue from the dropdown on the left to see its schedule availability calendar.</p>
            </div>
          ) : (
            <div className="bg-surface border border-surface-lighter rounded-2xl p-6 shadow-sm space-y-6">
              {/* Header Navigation Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleGoToToday}
                    className="px-4 py-2 border border-surface-lighter bg-surface-light rounded-lg text-sm font-semibold text-gray-100 hover:bg-surface-lighter transition-colors"
                  >
                    Today
                  </button>
                  <div className="flex border border-surface-lighter bg-surface-light rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={handlePrevWeek}
                      className="p-2 text-zinc-400 hover:text-gray-100 hover:bg-surface-lighter border-r border-surface-lighter transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextWeek}
                      className="p-2 text-zinc-400 hover:text-gray-100 hover:bg-surface-lighter transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <h2 className="text-lg font-bold text-gray-100">
                    {formatMonthYearHeader(currentDate)}
                  </h2>
                </div>
                <div className="text-xs text-zinc-400 font-medium">
                  Click green blocks to select. Click again to unselect.
                </div>
              </div>

              {/* Grid content */}
              <div className="overflow-x-auto">
                <div className="min-w-[600px] space-y-4">
                  {/* Column Headers */}
                  <div className="grid grid-cols-[80px_1fr] border-b border-surface-lighter pb-3 text-center">
                    <div className="w-20"></div>
                    <div className="grid grid-cols-7 gap-2">
                      {weekDays.map((day, idx) => {
                        const isToday = day.toDateString() === defaultDate.toDateString();
                        const weekdayName = day.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
                        const dayNumber = day.getDate();
                        return (
                          <div key={idx} className="space-y-1">
                            <span className={`text-[10px] font-bold block tracking-wider ${isToday ? "text-red-800" : "text-zinc-450"}`}>
                              {weekdayName}
                            </span>
                            <span className={`text-sm font-semibold block py-0.5 ${isToday ? "text-red-800 font-bold" : "text-gray-100"}`}>
                              {dayNumber}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Scrollable Container */}
                  <div className="max-h-[380px] overflow-y-auto pr-2 border border-surface-lighter/40 rounded-xl relative bg-white">
                    <div className="grid grid-cols-[80px_1fr] relative py-4">
                      {/* Left Hour labels */}
                      <div className="relative h-[320px]">
                        {hourLabels.map((lbl) => (
                          <div
                            key={lbl.label}
                            className="absolute right-3 text-[10px] text-zinc-450 font-semibold -translate-y-1/2"
                            style={{ top: `${lbl.ratio * 100}%` }}
                          >
                            {lbl.label}
                          </div>
                        ))}
                      </div>

                      {/* 7 Columns Grid representing slots */}
                      <div className="grid grid-cols-7 gap-2 h-[320px] grid-rows-9 relative">
                        <div className="absolute inset-0 grid grid-cols-7 pointer-events-none opacity-10 divide-x divide-surface-lighter" />
                        <div className="absolute inset-0 grid grid-rows-9 pointer-events-none opacity-10 divide-y divide-surface-lighter" />

                        {timeBlocks.map((block) => {
                          return weekDays.map((day, colIndex) => {
                            const status = getSlotStatus(day, block);
                            const formattedDate = day.toISOString().split("T")[0];
                            const startStr = `${formattedDate}T${String(block.startHour).padStart(2, "0")}:${String(block.startMin).padStart(2, "0")}`;
                            const endStr = `${formattedDate}T${String(block.endHour).padStart(2, "0")}:${String(block.endMin).padStart(2, "0")}`;

                            const isSelected = slots.some(s => s.startTime === startStr && s.endTime === endStr);

                            let cellStyles = "";
                            if (status === "past") {
                              cellStyles = "bg-zinc-50 border-zinc-100 text-zinc-400 cursor-not-allowed";
                            } else if (status === "blocked" || status === "reserved") {
                              cellStyles = "bg-red-50/50 border-red-100 text-red-500 cursor-not-allowed";
                            } else if (isSelected) {
                              cellStyles = "bg-primary text-white border-primary-dark ring-2 ring-primary/20 shadow-sm cursor-pointer hover:bg-primary-dark";
                            } else {
                              cellStyles = "bg-green-50/80 border-green-200 text-green-800 hover:bg-green-50 cursor-pointer hover:shadow-sm";
                            }

                            return (
                              <div
                                key={`${block.id}-${colIndex}`}
                                onClick={() => handleSelectSlot(day, block, status)}
                                className={`border rounded-lg p-1.5 flex flex-col justify-center items-center text-center text-[10px] font-semibold transition-all select-none ${cellStyles}`}
                                style={{
                                  gridColumn: colIndex + 1,
                                  gridRow: block.gridRow,
                                }}
                              >
                                <span className="block text-[9px] tracking-tight font-medium leading-none mb-0.5">
                                  {block.label.split(" - ")[0]}
                                </span>
                                <span className="block text-[9px] tracking-tight font-medium leading-none">
                                  {block.label.split(" - ")[1]}
                                </span>
                              </div>
                            );
                          });
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 text-xs pt-2 border-t border-surface-lighter text-zinc-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-green-50 border border-green-200 block" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-primary border border-primary-dark block" />
                      <span>Selected for Booking</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-red-50 border border-red-100 block" />
                      <span>Reserved / Blocked</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-zinc-50 border border-zinc-150 block" />
                      <span>Past / Closed</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
