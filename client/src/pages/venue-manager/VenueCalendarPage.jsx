import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import Button from "../../components/Button";
import Select from "../../components/Select";
import Input from "../../components/Input";
import Textarea from "../../components/Textarea";
import Modal from "../../components/Modal";
import { venueService } from "../../services/venueService";
import { blockedSlotService } from "../../services/blockedSlotService";
import { useAuth } from "../../hooks/useAuth";
import { formatDateTime } from "../../utils/formatDate";
import { toast } from "sonner";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Users, Settings, Lock } from "lucide-react";

export default function VenueCalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [venues, setVenues] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState(searchParams.get("venueId") || "");
  const [venueDetails, setVenueDetails] = useState(null);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // View state: 'month' | 'week' | 'day'
  const [viewMode, setViewMode] = useState("month");

  // Batch Configuration State (Month and Week views)
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [batchFormData, setBatchFormData] = useState({
    applyRateOverride: false,
    rate: "0",
    rateType: "HOURLY",
    applyScheduleOverride: false,
    openTime: "08:00",
    closeTime: "17:00",
    isClosed: false,
    clearOverrides: false,
  });

  // Inline Blocking Modal State
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockFormData, setBlockFormData] = useState({
    startTime: "",
    endTime: "",
    reason: "",
  });

  // Event Detail Modal States
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedBlockedSlot, setSelectedBlockedSlot] = useState(null);

  // Calendar navigation state
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Timeline configuration
  const timelineStart = 8; // 8 AM
  const timelineEnd = 18;  // 6 PM
  const timelineDuration = timelineEnd - timelineStart; // 10 hours

  const hourLabels = [
    { label: "8 AM", hour: 8 },
    { label: "9 AM", hour: 9 },
    { label: "10 AM", hour: 10 },
    { label: "11 AM", hour: 11 },
    { label: "12 PM", hour: 12 },
    { label: "1 PM", hour: 13 },
    { label: "2 PM", hour: 14 },
    { label: "3 PM", hour: 15 },
    { label: "4 PM", hour: 16 },
    { label: "5 PM", hour: 17 },
    { label: "6 PM", hour: 18 },
  ];

  // Fetch all venues and filter by manager
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await venueService.getAll();
        if (res.success && Array.isArray(res.data)) {
          const managed = res.data.filter((v) => v.createdById === user?.id);
          setVenues(managed);
          
          if (!selectedVenueId && managed.length > 0) {
            setSelectedVenueId(managed[0].id);
            setSearchParams({ venueId: managed[0].id });
          }
        }
      } catch (err) {
        console.error("Error fetching venues:", err);
      } finally {
        setLoadingVenues(false);
      }
    };
    if (user?.id) {
      fetchVenues();
    }
  }, [user]);

  // Sync selectedVenueId from search param
  useEffect(() => {
    const paramId = searchParams.get("venueId");
    if (paramId && paramId !== selectedVenueId) {
      setSelectedVenueId(paramId);
      setIsBatchMode(false);
      setSelectedDates(new Set());
    }
  }, [searchParams]);

  // Fetch venue details when selectedVenueId changes
  const fetchVenueDetails = async () => {
    if (!selectedVenueId) {
      setVenueDetails(null);
      return;
    }
    setLoadingDetails(true);
    try {
      const res = await venueService.getAvailability(selectedVenueId);
      if (res.success) {
        setVenueDetails(res.data);
      }
    } catch (err) {
      console.error("Error fetching venue details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchVenueDetails();
  }, [selectedVenueId]);

  const handleVenueChange = (e) => {
    const id = e.target.value;
    setSelectedVenueId(id);
    setIsBatchMode(false);
    setSelectedDates(new Set());
    if (id) {
      setSearchParams({ venueId: id });
    } else {
      setSearchParams({});
    }
  };

  // Unblock a slot
  const handleUnblock = async (slotId) => {
    if (!window.confirm("Are you sure you want to unblock this schedule? Clients will be able to reserve this slot again.")) return;
    
    setActionLoading(true);
    try {
      await blockedSlotService.delete(slotId);
      setSelectedBlockedSlot(null);
      await fetchVenueDetails();
      toast.success("Schedule slot unblocked successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete blocked slot.");
    } finally {
      setActionLoading(false);
    }
  };

  // Unified Prev / Next navigation
  const handlePrev = () => {
    if (viewMode === "month") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
      const newMonthDate = new Date(currentYear, currentMonth - 1, 1);
      setSelectedDate(newMonthDate);
    } else if (viewMode === "week") {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() - 7);
      setSelectedDate(newDate);
      setCurrentMonth(newDate.getMonth());
      setCurrentYear(newDate.getFullYear());
    } else if (viewMode === "day") {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() - 1);
      setSelectedDate(newDate);
      setCurrentMonth(newDate.getMonth());
      setCurrentYear(newDate.getFullYear());
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
      const newMonthDate = new Date(currentYear, currentMonth + 1, 1);
      setSelectedDate(newMonthDate);
    } else if (viewMode === "week") {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + 7);
      setSelectedDate(newDate);
      setCurrentMonth(newDate.getMonth());
      setCurrentYear(newDate.getFullYear());
    } else if (viewMode === "day") {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + 1);
      setSelectedDate(newDate);
      setCurrentMonth(newDate.getMonth());
      setCurrentYear(newDate.getFullYear());
    }
  };

  const handleGoToToday = () => {
    const t = new Date();
    setSelectedDate(t);
    setCurrentMonth(t.getMonth());
    setCurrentYear(t.getFullYear());
  };

  // Month Grid Calculations
  // Get first day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 6 is Saturday
  
  // Calculate days array including previous month fill and next month fill to create exactly 5 or 6 rows of 7 days
  const daysInActiveMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
  
  const monthDaysArray = [];
  
  // Fill previous month trailing days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    monthDaysArray.push(new Date(currentYear, currentMonth - 1, daysInPrevMonth - i));
  }
  
  // Fill current month days
  for (let i = 1; i <= daysInActiveMonth; i++) {
    monthDaysArray.push(new Date(currentYear, currentMonth, i));
  }
  
  // Fill next month leading days to complete full grid rows (multiple of 7)
  const remainingCells = 42 - monthDaysArray.length; // standard 6 rows
  for (let i = 1; i <= remainingCells; i++) {
    monthDaysArray.push(new Date(currentYear, currentMonth + 1, i));
  }

  // Get start of the week (Sunday) for a given date
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  // Generate 7 days of the active week
  const getWeekDays = () => {
    const start = getStartOfWeek(selectedDate);
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(start);
      nextDay.setDate(start.getDate() + i);
      weekDays.push(nextDay);
    }
    return weekDays;
  };

  // Get events on a specific day
  const getDayEvents = (date) => {
    if (!date || !venueDetails) return { reservations: [], blockedSlots: [] };

    const reservations = (venueDetails.reservations || []).filter((r) => {
      const rStart = new Date(r.startTime);
      const rEnd = new Date(r.endTime);
      const dStart = new Date(rStart.getFullYear(), rStart.getMonth(), rStart.getDate());
      const dEnd = new Date(rEnd.getFullYear(), rEnd.getMonth(), rEnd.getDate());
      return date >= dStart && date <= dEnd;
    });

    const blockedSlots = (venueDetails.blockedSlots || []).filter((b) => {
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      const dStart = new Date(bStart.getFullYear(), bStart.getMonth(), bStart.getDate());
      const dEnd = new Date(bEnd.getFullYear(), bEnd.getMonth(), bEnd.getDate());
      return date >= dStart && date <= dEnd;
    });

    return { reservations, blockedSlots };
  };

  const formatDateISO = (date) => {
    if (!date) return "";
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
  };

  // Helpers to resolve custom rates & schedule overrides per date
  const getDateConfig = (date) => {
    if (!date || !venueDetails || !venueDetails.dateConfigs) return null;
    const dateStr = formatDateISO(date);
    return venueDetails.dateConfigs.find((c) => {
      const cDate = new Date(c.date);
      const cStr = cDate.toISOString().split("T")[0];
      return cStr === dateStr;
    });
  };

  const getEffectiveDetails = (date) => {
    const config = getDateConfig(date);
    const defaults = venues.find((v) => v.id === selectedVenueId) || {};
    
    return {
      rate: config && config.rate !== null ? config.rate : (defaults.defaultRate ?? 0),
      rateType: config && config.rateType ? config.rateType : (defaults.defaultRateType || "HOURLY"),
      openTime: config && config.openTime ? config.openTime : (defaults.defaultOpenTime || "08:00"),
      closeTime: config && config.closeTime ? config.closeTime : (defaults.defaultCloseTime || "17:00"),
      isClosed: config ? config.isClosed : false,
      hasOverride: !!config
    };
  };

  const handleDateClick = (date) => {
    const dateStr = formatDateISO(date);
    if (isBatchMode) {
      setSelectedDates((prev) => {
        const next = new Set(prev);
        if (next.has(dateStr)) {
          next.delete(dateStr);
        } else {
          next.add(dateStr);
        }
        return next;
      });
    } else {
      setSelectedDate(date);
    }
  };

  const toggleBatchMode = () => {
    setIsBatchMode(!isBatchMode);
    setSelectedDates(new Set());
  };

  const handleSelectWeekdays = () => {
    const next = new Set(selectedDates);
    const arr = viewMode === "week" ? getWeekDays() : monthDaysArray;
    arr.forEach((date) => {
      if (date) {
        const day = date.getDay();
        if (day !== 0 && day !== 6) { // Monday-Friday
          next.add(formatDateISO(date));
        }
      }
    });
    setSelectedDates(next);
  };

  const handleSelectWeekends = () => {
    const next = new Set(selectedDates);
    const arr = viewMode === "week" ? getWeekDays() : monthDaysArray;
    arr.forEach((date) => {
      if (date) {
        const day = date.getDay();
        if (day === 0 || day === 6) { // Sunday, Saturday
          next.add(formatDateISO(date));
        }
      }
    });
    setSelectedDates(next);
  };

  const handleClearSelection = () => {
    setSelectedDates(new Set());
  };

  const handleBatchFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBatchFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const openConfigModal = () => {
    if (selectedDates.size === 0) {
      toast.error("Please select at least one date.");
      return;
    }
    const defaults = venues.find((v) => v.id === selectedVenueId) || {};
    setBatchFormData({
      applyRateOverride: false,
      rate: String(defaults.defaultRate ?? 0),
      rateType: defaults.defaultRateType || "HOURLY",
      applyScheduleOverride: false,
      openTime: defaults.defaultOpenTime || "08:00",
      closeTime: defaults.defaultCloseTime || "17:00",
      isClosed: false,
      clearOverrides: false,
    });
    setIsConfigModalOpen(true);
  };

  const openConfigForSingleDate = (date) => {
    const eff = getEffectiveDetails(date);
    setBatchFormData({
      applyRateOverride: eff.hasOverride && getDateConfig(date)?.rate !== null,
      rate: String(eff.rate),
      rateType: eff.rateType,
      applyScheduleOverride: eff.hasOverride && getDateConfig(date)?.openTime !== null,
      openTime: eff.openTime,
      closeTime: eff.closeTime,
      isClosed: eff.isClosed,
      clearOverrides: false,
    });
    const singleSet = new Set();
    singleSet.add(formatDateISO(date));
    setSelectedDates(singleSet);
    setIsConfigModalOpen(true);
  };

  const handleBatchSave = async (e) => {
    e.preventDefault();
    if (selectedDates.size === 0) return;
    
    const payload = {
      dates: Array.from(selectedDates),
      clearOverrides: batchFormData.clearOverrides,
    };
    
    if (!batchFormData.clearOverrides) {
      payload.isClosed = batchFormData.isClosed;
      if (batchFormData.applyRateOverride) {
        payload.rate = parseFloat(batchFormData.rate);
        payload.rateType = batchFormData.rateType;
      } else {
        payload.rate = null;
      }
      if (batchFormData.applyScheduleOverride) {
        payload.openTime = batchFormData.openTime;
        payload.closeTime = batchFormData.closeTime;
      } else {
        payload.openTime = null;
        payload.closeTime = null;
      }
    }
    
    setActionLoading(true);
    try {
      const res = await venueService.batchConfigureDates(selectedVenueId, payload);
      if (res.success) {
        toast.success(res.message || `Successfully configured ${selectedDates.size} date(s)!`);
        setIsConfigModalOpen(false);
        setIsBatchMode(false);
        setSelectedDates(new Set());
        await fetchVenueDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to configure dates.");
    } finally {
      setActionLoading(false);
    }
  };

  // Inline Blocking Modal Handlers
  const openBlockModal = (day = selectedDate, hour = 9) => {
    const dateStr = formatDateISO(day);
    const startStr = `${dateStr}T${String(hour).padStart(2, "0")}:00`;
    const endStr = `${dateStr}T${String(hour + 1).padStart(2, "0")}:00`;

    setBlockFormData({
      startTime: startStr,
      endTime: endStr,
      reason: "",
    });
    setIsBlockModalOpen(true);
  };

  const handleBlockFormChange = (e) => {
    setBlockFormData({ ...blockFormData, [e.target.name]: e.target.value });
  };

  const handleBlockSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await blockedSlotService.create({
        venueId: selectedVenueId,
        ...blockFormData,
      });
      toast.success("Schedule block applied successfully.");
      setIsBlockModalOpen(false);
      await fetchVenueDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create blocked slot.");
    } finally {
      setActionLoading(false);
    }
  };

  // Absolute positioning calculator (Timeline absolute placement)
  const calculatePosition = (startTimeStr, endTimeStr) => {
    const start = new Date(startTimeStr);
    const end = new Date(endTimeStr);
    
    // Expressed in local decimal hours
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    
    const clampedStart = Math.max(timelineStart, Math.min(timelineEnd, startHour));
    const clampedEnd = Math.max(timelineStart, Math.min(timelineEnd, endHour));
    
    const top = ((clampedStart - timelineStart) / timelineDuration) * 100;
    const height = ((clampedEnd - clampedStart) / timelineDuration) * 100;
    
    return { top: `${top}%`, height: `${height}%` };
  };

  const activeVenueName = venues.find(v => v.id === selectedVenueId)?.name || "Selected Venue";

  // Format week header to show month and year (e.g. July 2026)
  const formatWeekHeader = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Format time in 12-hour AMPM with leading zero (e.g. 08:00 AM)
  const formatTimeAMPM = (dateStr) => {
    const d = new Date(dateStr);
    let hours = d.getHours();
    let minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hStr = String(hours).padStart(2, '0');
    const mStr = String(minutes).padStart(2, '0');
    return `${hStr}:${mStr} ${ampm}`;
  };

  // Resolve reservation theme colors based on status (light-themed premium colors)
  const getReservationTheme = (status) => {
    if (status === "BOOKED_CONFIRMED") {
      return {
        bg: "bg-green-100 border border-green-200 text-green-800 hover:bg-green-200/80",
        text: "text-green-800",
        title: "text-green-800 font-bold",
        time: "text-green-600 font-semibold",
        location: "text-green-650",
        icon: "text-green-650",
        pill: "bg-green-100 border border-green-250 text-green-800 hover:bg-green-200",
      };
    } else if (
      status === "PAYMENT_PENDING" ||
      status === "PENCIL_BOOKED_DRAFT" ||
      status === "PAYMENT_OVERDUE"
    ) {
      return {
        bg: "bg-amber-100 border border-amber-200 text-amber-800 hover:bg-amber-200/80",
        text: "text-amber-800",
        title: "text-amber-800 font-bold",
        time: "text-amber-600 font-semibold",
        location: "text-amber-650",
        icon: "text-amber-650",
        pill: "bg-amber-100 border border-amber-250 text-amber-800 hover:bg-amber-200",
      };
    } else {
      return {
        bg: "bg-zinc-100 border border-dashed border-zinc-300 text-zinc-700 hover:bg-zinc-200/80",
        text: "text-zinc-700",
        title: "text-zinc-800 font-bold",
        time: "text-zinc-550 font-semibold",
        location: "text-zinc-550",
        icon: "text-zinc-550",
        pill: "bg-zinc-100 border border-dashed border-zinc-300 text-zinc-700 hover:bg-zinc-200",
      };
    }
  };

  const currentDayEff = getEffectiveDetails(selectedDate);
  const selectedDayEvents = getDayEvents(selectedDate);

  if (loadingVenues) return <LoadingState message="Loading your venue calendars..." />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Page Header */}
      <PageHeader
        title="Venue Calendar"
        subtitle="Manage rates, operating hours, and booking restrictions directly on the calendar grid"
      >
        <div className="flex flex-wrap items-center gap-3">
          {selectedVenueId && (
            <>
              {(viewMode === "month" || viewMode === "week") && (
                <Button
                  variant={isBatchMode ? "primary" : "secondary"}
                  onClick={toggleBatchMode}
                >
                  {isBatchMode ? "Exit Selection Mode" : "Batch Configuration Mode"}
                </Button>
              )}
              <Button variant="danger" onClick={() => openBlockModal(selectedDate, 9)}>
                Block Custom Time
              </Button>
            </>
          )}
        </div>
      </PageHeader>

      {venues.length === 0 ? (
        <EmptyState
          title="No Venues Found"
          message="Create a venue to configure rates and calendar schedule options."
        >
          <Link to="/vm/venues/add">
            <Button>Add a Venue</Button>
          </Link>
        </EmptyState>
      ) : (
        <>
          {/* Batch Configuration Selection Bar */}
          {isBatchMode && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
              <div>
                <h4 className="font-bold text-white text-base">Batch Configuration Mode Active</h4>
                <p className="text-sm text-gray-300">
                  Select dates below. Currently selected:{" "}
                  <strong className="text-primary font-bold text-lg">{selectedDates.size}</strong> date(s).
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={handleSelectWeekdays}>
                  Select Weekdays
                </Button>
                <Button variant="secondary" size="sm" onClick={handleSelectWeekends}>
                  Select Weekends
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClearSelection}>
                  Clear Selection
                </Button>
                <Button size="sm" onClick={openConfigModal} disabled={selectedDates.size === 0}>
                  Configure Selected ({selectedDates.size})
                </Button>
              </div>
            </div>
          )}

          {/* Venue Selector */}
          <div className="max-w-md bg-surface border border-surface-lighter rounded-xl p-4">
            <Select
              id="calendar-venue-select"
              label="Select Managed Venue"
              value={selectedVenueId}
              onChange={handleVenueChange}
              options={venues.map((v) => ({ value: v.id, label: v.name }))}
            />
          </div>

          {loadingDetails ? (
            <LoadingState message="Loading calendar details..." />
          ) : (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Unified Calendar controls & view switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleGoToToday}
                    className="px-4 py-2 border border-zinc-200 bg-white rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors shadow-sm"
                  >
                    Today
                  </button>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <h2 className="text-lg font-bold text-zinc-800 ml-2">
                    {viewMode === "month" && `${monthNames[currentMonth]} ${currentYear}`}
                    {viewMode === "week" && formatWeekHeader(selectedDate)}
                    {viewMode === "day" && selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                  </h2>
                </div>

                {/* Day / Week / Month tab switcher inside a pill container */}
                <div className="flex bg-zinc-100 p-1 rounded-full border border-zinc-200/60">
                  {[
                    { value: "day", label: "Day" },
                    { value: "week", label: "Week" },
                    { value: "month", label: "Month" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setViewMode(opt.value);
                        setIsBatchMode(false);
                        setSelectedDates(new Set());
                      }}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-full capitalize transition-all ${
                        viewMode === opt.value
                          ? "bg-white text-zinc-800 shadow-sm font-bold"
                          : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* MONTHLY GRID VIEW */}
              {viewMode === "month" && (
                <div className="space-y-4">
                  {/* Grid Headers */}
                  <div className="grid grid-cols-7 text-center text-xs font-bold text-zinc-500 border-b border-zinc-200 pb-3 uppercase tracking-wider">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                  </div>

                  {/* Grid Cells */}
                  <div className="grid grid-cols-7 grid-rows-6 gap-1 bg-zinc-150/40">
                    {monthDaysArray.map((day, idx) => {
                      const isToday = day.toDateString() === today.toDateString();
                      const isSelected = selectedDate.toDateString() === day.toDateString();
                      const dateStr = formatDateISO(day);
                      const isBatchSelected = isBatchMode && selectedDates.has(dateStr);
                      const isDifferentMonth = day.getMonth() !== currentMonth;

                      const { reservations, blockedSlots } = getDayEvents(day);
                      const eff = getEffectiveDetails(day);

                      let bgClass = isDifferentMonth 
                        ? "bg-zinc-50/40 text-zinc-400 border-zinc-200/40" 
                        : "bg-white text-zinc-800 border-zinc-200";
                      
                      if (isBatchSelected) {
                        bgClass = "bg-primary/10 border-primary text-primary font-bold";
                      } else if (isSelected && !isBatchMode) {
                        bgClass = "bg-zinc-55 border-zinc-300 text-zinc-950 font-semibold";
                      } else if (isToday) {
                        bgClass = "bg-white border-zinc-350 text-zinc-950 font-bold";
                      } else if (eff.isClosed) {
                        bgClass = "bg-zinc-50/80 border-zinc-200/50 text-zinc-400 line-through";
                      }

                      return (
                        <div
                          key={`month-day-${idx}`}
                          onClick={() => handleDateClick(day)}
                          className={`min-h-[110px] rounded-lg p-2 border flex flex-col justify-between transition-all hover:border-zinc-350 cursor-pointer ${bgClass}`}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`text-xs font-semibold ${isToday ? "bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center font-bold" : "text-zinc-650"}`}>
                              {day.getDate()}
                            </span>

                            {/* Options to quick-override date */}
                            {!isBatchMode && !isDifferentMonth && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openConfigForSingleDate(day);
                                }}
                                className="text-[10px] opacity-0 hover:opacity-100 hover:text-primary transition-opacity"
                                title="Customize this date"
                              >
                                <Settings className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Event list pills inside cell */}
                          <div className="flex-1 mt-1.5 space-y-1 overflow-y-auto max-h-[64px] pr-0.5 scrollbar-thin">
                            {eff.isClosed && (
                              <div className="text-[9px] font-bold bg-zinc-100 border border-zinc-250 text-zinc-500 rounded px-1.5 py-0.5 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" /> Closed
                              </div>
                            )}

                            {blockedSlots.map((b) => (
                              <div
                                key={b.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBlockedSlot(b);
                                }}
                                className="text-[9px] font-semibold bg-zinc-100 border border-zinc-200 text-zinc-700 rounded px-1.5 py-0.5 truncate hover:bg-zinc-200 transition-colors"
                              >
                                [Blocked] {b.reason || "Maintenance"}
                              </div>
                            ))}

                            {reservations.map((r) => {
                              const theme = getReservationTheme(r.status);
                              const timeString = new Date(r.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: false });
                              return (
                                <div
                                  key={r.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedReservation(r);
                                  }}
                                  className={`text-[9px] font-bold rounded px-1.5 py-0.5 truncate transition-colors ${theme.pill}`}
                                >
                                  {timeString} {r.eventTitle}
                                </div>
                              );
                            })}
                          </div>

                          {/* Inline Rate indication */}
                          {eff.hasOverride && !eff.isClosed && (
                            <span className="text-[9px] text-warning font-semibold block mt-1 self-end">
                              ₱{eff.rate.toLocaleString()} ({eff.rateType === "HOURLY" ? "hr" : "flat"})
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* WEEKLY TIMELINE GRID VIEW */}
              {viewMode === "week" && (
                <div className="overflow-x-auto">
                  <div className="min-w-[800px] space-y-4">
                    
                    {/* Columns Headers */}
                    <div className="grid grid-cols-[80px_1fr] border-b border-zinc-200 pb-3 text-center">
                      <div className="w-20"></div>
                      <div className="grid grid-cols-7 gap-2">
                        {getWeekDays().map((day, idx) => {
                          const isToday = day.toDateString() === today.toDateString();
                          const isSelected = selectedDate.toDateString() === day.toDateString();
                          const weekdayName = day.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
                          const dayNumber = day.getDate();

                          return (
                            <div
                              key={idx}
                              onClick={() => handleDateClick(day)}
                              className={`space-y-1 py-1 rounded-xl cursor-pointer hover:bg-zinc-50 transition ${
                                isSelected && !isBatchMode ? "bg-zinc-100/50 border border-zinc-200" : ""
                              }`}
                            >
                              <span className={`text-[10px] font-bold block tracking-wider ${isToday ? "text-primary" : "text-zinc-400"}`}>
                                {weekdayName}
                              </span>
                              <span className="text-base font-bold text-zinc-800 block py-0.5">
                                {dayNumber}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Scrollable hourly grid container */}
                    <div className="border border-zinc-200 rounded-xl bg-white relative overflow-hidden">
                      <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                        <div className="grid grid-cols-[80px_1fr] relative py-4">
                          
                          {/* Hour marker labels column */}
                          <div className="relative h-[480px]">
                            {hourLabels.map((lbl, idx) => (
                              <div
                                key={lbl.label}
                                className="absolute right-4 text-xs text-zinc-400 font-semibold -translate-y-1/2"
                                style={{ top: `${(idx / 10) * 100}%` }}
                              >
                                {lbl.label}
                              </div>
                            ))}
                          </div>

                          {/* 7 Columns Timeline */}
                          <div className="grid grid-cols-7 gap-2 h-[480px] relative">
                            
                            {/* Horizontal divider lines for each hour */}
                            {Array.from({ length: 11 }).map((_, hourIdx) => (
                              <div
                                key={`grid-line-${hourIdx}`}
                                className="absolute left-0 right-0 border-b border-zinc-150/60 pointer-events-none"
                                style={{ top: `${(hourIdx / 10) * 100}%` }}
                              />
                            ))}

                            {/* Column vertical dividers */}
                            <div className="absolute inset-0 grid grid-cols-7 pointer-events-none opacity-20 divide-x divide-zinc-200" />

                            {/* Clickable slot blocks in background */}
                            {getWeekDays().map((day, colIndex) => {
                              const dateStr = formatDateISO(day);
                              const isBatchSelected = isBatchMode && selectedDates.has(dateStr);
                              const eff = getEffectiveDetails(day);

                              return (
                                <div key={`day-col-${colIndex}`} className="relative h-full">
                                  
                                  {/* If closed, render a full-day block card */}
                                  {eff.isClosed && (
                                    <div className="absolute inset-0 bg-danger/5 text-danger border border-danger/20 rounded-lg m-1 z-10 flex flex-col items-center justify-center gap-1.5 p-2 font-bold text-xs select-none">
                                      <Lock className="w-4 h-4" /> Closed
                                    </div>
                                  )}

                                  {/* Overlay interactive block triggers in background */}
                                  {!eff.isClosed && Array.from({ length: 10 }).map((_, hourIdx) => {
                                    const hour = timelineStart + hourIdx;
                                    return (
                                      <div
                                        key={`hour-block-${hourIdx}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (isBatchMode) {
                                            handleDateClick(day);
                                          } else {
                                            setSelectedDate(day);
                                            openBlockModal(day, hour);
                                          }
                                        }}
                                        className="absolute left-0 right-0 hover:bg-zinc-50 transition-colors cursor-pointer"
                                        style={{
                                          top: `${(hourIdx / 10) * 100}%`,
                                          height: `${100 / 10}%`,
                                        }}
                                      />
                                    );
                                  })}

                                  {/* Render day events absolutely positioned */}
                                  {!eff.isClosed && (
                                    <>
                                      {/* Render Blocked slots */}
                                      {getDayEvents(day).blockedSlots.map((b) => {
                                        const pos = calculatePosition(b.startTime, b.endTime);
                                        return (
                                          <div
                                            key={b.id}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedBlockedSlot(b);
                                            }}
                                            className="absolute left-1 right-1 bg-zinc-100 border border-zinc-250 text-zinc-800 rounded-lg p-2 z-20 cursor-pointer overflow-hidden text-xs select-none hover:bg-zinc-200 transition-colors"
                                            style={{ top: pos.top, height: pos.height }}
                                          >
                                            <div className="font-bold flex items-center gap-1 text-[10px] md:text-xs text-zinc-700">
                                              <Lock className="w-3 h-3" /> Locked Slot
                                            </div>
                                            <p className="mt-0.5 text-[9px] md:text-xs text-zinc-500 truncate">{b.reason || "Maintenance"}</p>
                                          </div>
                                        );
                                      })}

                                      {/* Render Reservations */}
                                      {getDayEvents(day).reservations.map((r) => {
                                        const pos = calculatePosition(r.startTime, r.endTime);
                                        const theme = getReservationTheme(r.status);
                                        return (
                                          <div
                                            key={r.id}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedReservation(r);
                                            }}
                                            className={`absolute left-1 right-1 border rounded-lg p-2.5 z-20 cursor-pointer overflow-hidden select-none hover:bg-green-200/90 transition-all flex flex-col justify-between ${theme.bg}`}
                                            style={{ top: pos.top, height: pos.height }}
                                          >
                                            <div>
                                              <h4 className={`text-[10px] md:text-xs truncate ${theme.title}`}>{r.eventTitle}</h4>
                                              <p className={`text-[9px] md:text-[10px] mt-0.5 ${theme.time}`}>
                                                {formatTimeAMPM(r.startTime)} - {formatTimeAMPM(r.endTime)}
                                              </p>
                                            </div>
                                            <div className={`flex items-center gap-1 text-[8px] md:text-[9px] mt-1 truncate ${theme.location}`}>
                                              <MapPin className={`w-2.5 h-2.5 flex-none ${theme.icon}`} /> {activeVenueName}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DAILY TIMELINE GRID VIEW */}
              {viewMode === "day" && (
                <div className="overflow-x-auto">
                  <div className="min-w-[500px] space-y-4">
                    
                    {/* Date Column Header */}
                    <div className="grid grid-cols-[80px_1fr] border-b border-zinc-200 pb-3 text-center">
                      <div className="w-20"></div>
                      <div className="flex flex-col justify-center items-center py-1">
                        <span className="text-xs font-bold text-zinc-400 tracking-wider">
                          {selectedDate.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
                        </span>
                        <span className="text-base font-bold text-zinc-800 block mt-0.5">
                          {selectedDate.getDate()}
                        </span>
                      </div>
                    </div>

                    {/* Hourly timeline */}
                    <div className="border border-zinc-200 rounded-xl bg-white relative overflow-hidden">
                      <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                        <div className="grid grid-cols-[80px_1fr] relative py-4">
                          
                          {/* Hour markings axis */}
                          <div className="relative h-[480px]">
                            {hourLabels.map((lbl, idx) => (
                              <div
                                key={lbl.label}
                                className="absolute right-4 text-xs text-zinc-400 font-semibold -translate-y-1/2"
                                style={{ top: `${(idx / 10) * 100}%` }}
                              >
                                {lbl.label}
                              </div>
                            ))}
                          </div>

                          {/* Single Column Timeline */}
                          <div className="relative h-[480px] mr-4">
                            
                            {/* Horizontal divider lines for each hour */}
                            {Array.from({ length: 11 }).map((_, hourIdx) => (
                              <div
                                key={`grid-line-${hourIdx}`}
                                className="absolute left-0 right-0 border-b border-zinc-150/60 pointer-events-none"
                                style={{ top: `${(hourIdx / 10) * 100}%` }}
                              />
                            ))}

                            {/* Underline operating hours constraints */}
                            {currentDayEff && (
                              <div className="absolute inset-0">
                                
                                {/* If closed, show closed banner */}
                                {currentDayEff.isClosed ? (
                                  <div className="absolute inset-0 bg-danger/5 text-danger border border-danger/20 rounded-lg z-10 flex flex-col items-center justify-center gap-2 p-4 font-bold text-sm">
                                    <Lock className="w-6 h-6" /> Closed
                                  </div>
                                ) : (
                                  <>
                                    {/* Transparent block overlays */}
                                    {Array.from({ length: 10 }).map((_, hourIdx) => {
                                      const hour = timelineStart + hourIdx;
                                      return (
                                        <div
                                          key={`hour-block-single-${hourIdx}`}
                                          onClick={() => openBlockModal(selectedDate, hour)}
                                          className="absolute left-0 right-0 hover:bg-zinc-50 transition-colors cursor-pointer"
                                          style={{
                                            top: `${(hourIdx / 10) * 100}%`,
                                            height: `${100 / 10}%`,
                                          }}
                                          title="Click to apply block on this slot"
                                        />
                                      );
                                    })}

                                    {/* Blocked slots overlay */}
                                    {selectedDayEvents.blockedSlots.map((b) => {
                                      const pos = calculatePosition(b.startTime, b.endTime);
                                      return (
                                        <div
                                          key={b.id}
                                          onClick={() => setSelectedBlockedSlot(b)}
                                          className="absolute left-1 right-1 bg-zinc-100 border border-zinc-250 text-zinc-800 rounded-lg p-3 z-20 cursor-pointer overflow-hidden hover:bg-zinc-200 transition-colors flex items-center justify-between shadow-sm"
                                          style={{ top: pos.top, height: pos.height }}
                                        >
                                          <div className="flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-zinc-500 flex-none" />
                                            <div>
                                              <span className="font-bold text-xs block text-zinc-855">Blocked Slot</span>
                                              <span className="text-[11px] text-zinc-500 italic">"{b.reason || "Facility Maintenance"}"</span>
                                            </div>
                                          </div>
                                          <span className="text-[10px] text-zinc-500">
                                            {formatTimeAMPM(b.startTime)} - {formatTimeAMPM(b.endTime)}
                                          </span>
                                        </div>
                                      );
                                    })}

                                    {/* Reservations overlay */}
                                    {selectedDayEvents.reservations.map((r) => {
                                      const pos = calculatePosition(r.startTime, r.endTime);
                                      const theme = getReservationTheme(r.status);
                                      return (
                                        <div
                                          key={r.id}
                                          onClick={() => setSelectedReservation(r)}
                                          className={`absolute left-1 right-1 border rounded-lg p-3 z-20 cursor-pointer overflow-hidden transition-all flex flex-col justify-between shadow-sm ${theme.bg}`}
                                          style={{ top: pos.top, height: pos.height }}
                                        >
                                          <div>
                                            <h4 className={`font-bold text-xs ${theme.title}`}>{r.eventTitle}</h4>
                                            <p className={`text-[10px] mt-0.5 ${theme.time}`}>
                                              {formatTimeAMPM(r.startTime)} - {formatTimeAMPM(r.endTime)}
                                            </p>
                                          </div>
                                          <div className={`flex items-center gap-1 text-[9px] mt-1 truncate ${theme.location}`}>
                                            <MapPin className={`w-2.5 h-2.5 flex-none ${theme.icon}`} /> {activeVenueName}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Quick Panel */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50/60 p-4 border border-zinc-200 rounded-xl">
                {currentDayEff && (
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Rate for {selectedDate.getDate()} {monthNames[currentMonth]}</span>
                      <span className="text-sm font-bold text-zinc-800">
                        ₱{currentDayEff.rate.toLocaleString()} / {currentDayEff.rateType === "HOURLY" ? "hour" : "flat"}
                        {getDateConfig(selectedDate)?.rate !== undefined && (
                          <span className="text-[9px] bg-warning/10 border border-warning/20 text-warning px-1 rounded ml-1.5 font-bold uppercase tracking-wider">
                            Custom
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-px h-8 bg-zinc-200 hidden md:block" />
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Operating hours</span>
                      <span className={`text-sm font-bold ${currentDayEff.isClosed ? "text-danger" : "text-zinc-800"}`}>
                        {currentDayEff.isClosed ? "Closed / Blocked" : `${currentDayEff.openTime} - ${currentDayEff.closeTime}`}
                        {getDateConfig(selectedDate)?.openTime !== undefined && (
                          <span className="text-[9px] bg-warning/10 border border-warning/20 text-warning px-1 rounded ml-1.5 font-bold uppercase tracking-wider">
                            Custom Hours
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 w-full md:w-auto">
                  <Button
                    variant="outline"
                    className="flex-1 md:flex-none"
                    onClick={() => openConfigForSingleDate(selectedDate)}
                  >
                    Customize Date Overrides
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1 md:flex-none"
                    onClick={() => openBlockModal(selectedDate, 9)}
                  >
                    Block Custom Time
                  </Button>
                </div>
              </div>

            </div>
          )}
        </>
      )}

      {/* Inline Block Slot Modal */}
      <Modal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        title="Block Schedule / Slot"
        size="md"
      >
        <form onSubmit={handleBlockSave} className="space-y-4">
          <p className="text-xs text-gray-400">
            Apply a schedule lock on the selected slot. Clients will not be able to request reservations during this range.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="startTime"
              name="startTime"
              label="Block Start"
              type="datetime-local"
              value={blockFormData.startTime}
              onChange={handleBlockFormChange}
              required
            />
            <Input
              id="endTime"
              name="endTime"
              label="Block End"
              type="datetime-local"
              value={blockFormData.endTime}
              onChange={handleBlockFormChange}
              required
            />
          </div>

          <Textarea
            id="reason"
            name="reason"
            label="Reason for Block"
            placeholder="e.g. Maintenance, local holiday, or closed for private university function"
            value={blockFormData.reason}
            onChange={handleBlockFormChange}
            rows={2}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-lighter">
            <Button variant="ghost" type="button" onClick={() => setIsBlockModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={actionLoading}>
              Apply Block
            </Button>
          </div>
        </form>
      </Modal>

      {/* Batch / Single Date Override Configuration Modal */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title={selectedDates.size === 1 ? "Configure Single Date" : `Batch Configure ${selectedDates.size} Date(s)`}
        size="md"
      >
        <form onSubmit={handleBatchSave} className="space-y-5">
          <p className="text-xs text-gray-400 leading-relaxed">
            Specify customized rates or schedule overrides for the selected dates.
          </p>

          <div className="bg-surface border border-surface-lighter rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <input
                id="clearOverrides"
                name="clearOverrides"
                type="checkbox"
                checked={batchFormData.clearOverrides}
                onChange={handleBatchFormChange}
                className="w-4 h-4 rounded text-primary focus:ring-primary/40 border-surface-lighter"
              />
              <label htmlFor="clearOverrides" className="text-sm font-semibold text-white cursor-pointer">
                Reset to default venue rates and schedules
              </label>
            </div>
          </div>

          {!batchFormData.clearOverrides && (
            <>
              {/* Rate Override Section */}
              <div className="bg-surface border border-surface-lighter rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    id="applyRateOverride"
                    name="applyRateOverride"
                    type="checkbox"
                    checked={batchFormData.applyRateOverride}
                    onChange={handleBatchFormChange}
                    className="w-4 h-4 rounded text-primary focus:ring-primary/40 border-surface-lighter"
                  />
                  <label htmlFor="applyRateOverride" className="text-sm font-semibold text-white cursor-pointer">
                    Override Rate & Pricing
                  </label>
                </div>

                {batchFormData.applyRateOverride && (
                  <div className="grid grid-cols-2 gap-3 pl-6 animate-in slide-in-from-top-2 duration-150">
                    <Input
                      id="rate"
                      name="rate"
                      label="Override Rate (₱)"
                      type="number"
                      min="0"
                      step="any"
                      value={batchFormData.rate}
                      onChange={handleBatchFormChange}
                      required
                    />
                    <Select
                      id="rateType"
                      name="rateType"
                      label="Override Type"
                      value={batchFormData.rateType}
                      onChange={handleBatchFormChange}
                      placeholder="Select type"
                      options={[
                        { value: "HOURLY", label: "Hourly Rate" },
                        { value: "FLAT", label: "Flat Rate" },
                      ]}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Operating Hours Override Section */}
              <div className="bg-surface border border-surface-lighter rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    id="applyScheduleOverride"
                    name="applyScheduleOverride"
                    type="checkbox"
                    checked={batchFormData.applyScheduleOverride}
                    onChange={handleBatchFormChange}
                    className="w-4 h-4 rounded text-primary focus:ring-primary/40 border-surface-lighter"
                    disabled={batchFormData.isClosed}
                  />
                  <label htmlFor="applyScheduleOverride" className={`text-sm font-semibold cursor-pointer ${batchFormData.isClosed ? "text-gray-500" : "text-white"}`}>
                    Override Operating Hours
                  </label>
                </div>

                {batchFormData.applyScheduleOverride && !batchFormData.isClosed && (
                  <div className="grid grid-cols-2 gap-3 pl-6 animate-in slide-in-from-top-2 duration-150">
                    <Input
                      id="openTime"
                      name="openTime"
                      label="Open Time"
                      type="time"
                      value={batchFormData.openTime}
                      onChange={handleBatchFormChange}
                      required
                    />
                    <Input
                      id="closeTime"
                      name="closeTime"
                      label="Close Time"
                      type="time"
                      value={batchFormData.closeTime}
                      onChange={handleBatchFormChange}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Closed Status Override */}
              <div className="bg-surface border border-surface-lighter rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    id="isClosed"
                    name="isClosed"
                    type="checkbox"
                    checked={batchFormData.isClosed}
                    onChange={(e) => {
                      const closed = e.target.checked;
                      setBatchFormData((prev) => ({
                        ...prev,
                        isClosed: closed,
                        // Turn off hours override if closed
                        applyScheduleOverride: closed ? false : prev.applyScheduleOverride
                      }));
                    }}
                    className="w-4 h-4 rounded text-primary focus:ring-primary/40 border-surface-lighter"
                  />
                  <label htmlFor="isClosed" className="text-sm font-semibold text-danger cursor-pointer">
                    Set Closed / Unavailable for these dates
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-lighter">
            <Button variant="ghost" type="button" onClick={() => setIsConfigModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={actionLoading}>
              Save Overrides
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reservation Details Dialog Modal */}
      <Modal
        isOpen={!!selectedReservation}
        onClose={() => setSelectedReservation(null)}
        title="Reservation Overview"
        size="md"
      >
        {selectedReservation && (
          <div className="space-y-4">
            <div className="p-4 bg-surface-light border border-surface-lighter rounded-xl space-y-3">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Event Title</span>
                <span className="text-sm font-bold text-white block mt-0.5">{selectedReservation.eventTitle}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Start Time</span>
                  <span className="text-xs text-white font-medium block mt-0.5">{formatDateTime(selectedReservation.startTime)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">End Time</span>
                  <span className="text-xs text-white font-medium block mt-0.5">{formatDateTime(selectedReservation.endTime)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Status</span>
                  <span className="text-xs font-bold text-green-400 block mt-0.5 capitalize">{selectedReservation.status.toLowerCase().replaceAll("_", " ")}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Venue</span>
                  <span className="text-xs text-white font-medium block mt-0.5">{activeVenueName}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-surface-lighter">
              <Button variant="ghost" onClick={() => setSelectedReservation(null)}>
                Close
              </Button>
              <Link to={`/vm/reservations/${selectedReservation.id}`}>
                <Button>
                  Open Booking Page
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* Blocked Slot Details Dialog Modal */}
      <Modal
        isOpen={!!selectedBlockedSlot}
        onClose={() => setSelectedBlockedSlot(null)}
        title="Schedule Block Details"
        size="md"
      >
        {selectedBlockedSlot && (
          <div className="space-y-4">
            <div className="p-4 bg-surface-light border border-surface-lighter rounded-xl space-y-3">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Lock Reason</span>
                <span className="text-sm font-bold text-white block mt-0.5">{selectedBlockedSlot.reason || "Facility Maintenance / Holiday"}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Start Date/Time</span>
                  <span className="text-xs text-white font-medium block mt-0.5">{formatDateTime(selectedBlockedSlot.startTime)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">End Date/Time</span>
                  <span className="text-xs text-white font-medium block mt-0.5">{formatDateTime(selectedBlockedSlot.endTime)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-surface-lighter">
              <Button variant="ghost" onClick={() => setSelectedBlockedSlot(null)}>
                Close
              </Button>
              <Button
                variant="danger"
                loading={actionLoading}
                onClick={() => handleUnblock(selectedBlockedSlot.id)}
              >
                Unblock Schedule
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
