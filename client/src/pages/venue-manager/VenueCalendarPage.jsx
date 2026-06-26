import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import Button from "../../components/Button";
import Select from "../../components/Select";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import { venueService } from "../../services/venueService";
import { blockedSlotService } from "../../services/blockedSlotService";
import { useAuth } from "../../hooks/useAuth";
import { formatDateTime } from "../../utils/formatDate";
import { toast } from "sonner";

export default function VenueCalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [venues, setVenues] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState(searchParams.get("venueId") || "");
  const [venueDetails, setVenueDetails] = useState(null);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Batch Configuration State
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

  // Calendar navigation state
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Fetch all venues and filter by manager
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await venueService.getAll();
        if (res.success && Array.isArray(res.data)) {
          // Only show venues created by this user
          const managed = res.data.filter((v) => v.createdById === user?.id);
          setVenues(managed);
          
          // Auto select first venue if none selected and venues exist
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

  // Fetch venue details (blocked slots & reservations) when selectedVenueId changes
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
      await fetchVenueDetails();
      toast.success("Schedule slot unblocked successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete blocked slot.");
    } finally {
      setActionLoading(false);
    }
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(new Date(currentYear, currentMonth, i));
  }

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
    if (isBatchMode) {
      const dateStr = formatDateISO(date);
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
    daysArray.forEach((date) => {
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
    daysArray.forEach((date) => {
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
    // Seed modal form from default venue settings
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
        payload.rate = null; // Don't override
      }
      if (batchFormData.applyScheduleOverride) {
        payload.openTime = batchFormData.openTime;
        payload.closeTime = batchFormData.closeTime;
      } else {
        payload.openTime = null; // Don't override
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

  const selectedDayEvents = getDayEvents(selectedDate);
  const totalSelectedEvents = selectedDayEvents.reservations.length + selectedDayEvents.blockedSlots.length;
  const currentDayEff = selectedVenueId ? getEffectiveDetails(selectedDate) : null;

  if (loadingVenues) return <LoadingState message="Loading your venue calendars..." />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Venue Calendar"
        subtitle="Manage schedules, default settings, and overrides for your managed venues"
      >
        <div className="flex flex-wrap gap-3">
          {selectedVenueId && (
            <>
              <Button
                variant={isBatchMode ? "primary" : "secondary"}
                onClick={toggleBatchMode}
              >
                {isBatchMode ? "Cancel Selection Mode" : "Batch Configuration Mode"}
              </Button>
              <Link to={`/vm/block-schedule?venueId=${selectedVenueId}&date=${formatDateISO(selectedDate)}`}>
                <Button variant="danger">Block Time Slots</Button>
              </Link>
            </>
          )}
        </div>
      </PageHeader>

      {venues.length === 0 ? (
        <EmptyState
          title="No Venues Found"
          message="You aren't managing any venues yet. Create a venue to view and manage its calendar schedule."
        >
          <Link to="/vm/venues/add">
            <Button>Add a Venue</Button>
          </Link>
        </EmptyState>
      ) : (
        <>
          {/* Batch Mode Selection Banner */}
          {isBatchMode && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
              <div>
                <h4 className="font-bold text-white text-base">Batch Configuration Mode Active</h4>
                <p className="text-sm text-gray-300">
                  Select multiple calendar cells below to update their rate or schedules together. Selected:{" "}
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
            <LoadingState message="Loading schedule details..." />
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Calendar Grid */}
              <div className="lg:col-span-2 bg-surface border border-surface-lighter rounded-2xl p-6">
                
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">
                    {monthNames[currentMonth]} {currentYear}
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={handlePrevMonth}>
                      &larr; Prev
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleNextMonth}>
                      Next &rarr;
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-400 mb-2">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {daysArray.map((date, idx) => {
                    if (!date) {
                      return <div key={`empty-${idx}`} className="aspect-square bg-surface-dark/20 rounded-lg"></div>;
                    }

                    const { reservations, blockedSlots } = getDayEvents(date);
                    const dateStr = formatDateISO(date);
                    
                    const isBatchSelected = isBatchMode && selectedDates.has(dateStr);
                    const isSingleSelected = !isBatchMode && selectedDate && selectedDate.toDateString() === date.toDateString();
                    const isToday = today.toDateString() === date.toDateString();
                    
                    const eff = getEffectiveDetails(date);

                    const baseClass = "aspect-square rounded-lg flex flex-col justify-between p-2 text-left relative transition-all group hover:border-primary/50 border cursor-pointer";
                    let bgClass = "bg-surface-light/40 border-surface-lighter text-gray-300";

                    if (isBatchSelected) {
                      bgClass = "bg-primary border-primary text-white font-bold shadow-lg shadow-primary/30";
                    } else if (isSingleSelected) {
                      bgClass = "bg-primary/20 border-primary text-white font-bold";
                    } else if (isToday) {
                      bgClass = "bg-surface-light border-secondary/50 text-secondary";
                    } else if (eff.isClosed) {
                      bgClass = "bg-danger/10 border-danger/20 text-gray-500 line-through";
                    }

                    return (
                      <button
                        key={`day-${date.getDate()}`}
                        onClick={() => handleDateClick(date)}
                        type="button"
                        className={`${baseClass} ${bgClass}`}
                      >
                        <span className="text-xs font-medium">{date.getDate()}</span>
                        
                        <div className="flex flex-wrap gap-1 mt-auto justify-between items-center w-full">
                          <div className="flex gap-1">
                            {blockedSlots.length > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-danger" title={`${blockedSlots.length} Blocked slot(s)`}></span>
                            )}
                            {reservations.length > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-info" title={`${reservations.length} Reservation(s)`}></span>
                            )}
                          </div>
                          
                          {eff.hasOverride && (
                            <span className="text-[10px] font-bold text-warning" title="Date override configuration active">
                              ₱
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Details Side Card */}
              <div className="bg-surface border border-surface-lighter rounded-2xl p-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        Schedule Details
                      </h3>
                      <p className="text-sm text-gray-400">
                        {selectedDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    
                    {!isBatchMode && currentDayEff && (
                      <button
                        type="button"
                        onClick={() => openConfigForSingleDate(selectedDate)}
                        className="text-xs text-primary hover:underline font-bold"
                      >
                        Customize Date
                      </button>
                    )}
                  </div>

                  {/* Pricing and Operating Hours Overview */}
                  {currentDayEff && (
                    <div className="p-4 bg-surface-light border border-surface-lighter rounded-xl space-y-3">
                      <div>
                        <span className="text-xs text-gray-400 block font-medium">Pricing / Rate</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm font-bold text-white">
                            ₱{currentDayEff.rate.toLocaleString()} / {currentDayEff.rateType === "HOURLY" ? "hour" : "flat"}
                          </span>
                          {getDateConfig(selectedDate)?.rate !== undefined && (
                            <span className="text-[10px] bg-warning/20 border border-warning/30 text-warning px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              Custom Override
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-px bg-surface-lighter" />
                      <div>
                        <span className="text-xs text-gray-400 block font-medium">Operating Hours</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-sm font-bold ${currentDayEff.isClosed ? "text-danger" : "text-white"}`}>
                            {currentDayEff.isClosed ? "Closed / Blocked" : `${currentDayEff.openTime} - ${currentDayEff.closeTime}`}
                          </span>
                          {getDateConfig(selectedDate)?.openTime !== undefined && (
                            <span className="text-[10px] bg-warning/20 border border-warning/30 text-warning px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              Custom Hours
                            </span>
                          )}
                          {currentDayEff.isClosed && (
                            <span className="text-[10px] bg-danger/20 border border-danger/30 text-danger px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              Closed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {totalSelectedEvents === 0 ? (
                    <div className="text-center py-8 bg-surface-dark/30 rounded-xl border border-surface-lighter/50">
                      <span className="text-3xl">🟢</span>
                      <p className="text-sm text-gray-300 font-medium mt-2">No Bookings or Blocks</p>
                      <p className="text-xs text-gray-500 mt-1">This day is completely free.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                      {/* Blocked Slots */}
                      {selectedDayEvents.blockedSlots.map((b) => (
                        <div key={b.id} className="p-3 bg-danger/10 border border-danger/30 rounded-xl space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-danger bg-danger/20 px-2 py-0.5 rounded">
                              BLOCKED
                            </span>
                            <button
                              onClick={() => handleUnblock(b.id)}
                              disabled={actionLoading}
                              className="text-xs text-danger hover:underline font-medium"
                            >
                              Unblock
                            </button>
                          </div>
                          <p className="text-sm font-medium text-white">{b.reason || "Blocked slot"}</p>
                          <p className="text-xs text-gray-400">
                            {formatDateTime(b.startTime).split(" ")[3] + " " + formatDateTime(b.startTime).split(" ")[4]} - {formatDateTime(b.endTime).split(" ")[3] + " " + formatDateTime(b.endTime).split(" ")[4]}
                          </p>
                        </div>
                      ))}

                      {/* Approved Reservations */}
                      {selectedDayEvents.reservations.map((r) => (
                        <div key={r.id} className="p-3 bg-info/10 border border-info/30 rounded-xl space-y-1">
                          <div className="flex justify-between items-center">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              r.status === "PENCIL_BOOKED_DRAFT"
                                ? "text-zinc-600 bg-zinc-100 border border-zinc-300 border-dashed"
                                : r.status === "BOOKED_CONFIRMED"
                                ? "text-green-800 bg-green-50"
                                : "text-info bg-info/20"
                            }`}>
                              {r.status === "PENCIL_BOOKED_DRAFT"
                                ? "PENCIL BOOKED"
                                : r.status === "BOOKED_CONFIRMED"
                                ? "BOOKED"
                                : r.status.replaceAll("_", " ")}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-white">{r.eventTitle}</p>
                          <p className="text-xs text-gray-400">
                            {formatDateTime(r.startTime).split(" ")[3] + " " + formatDateTime(r.startTime).split(" ")[4]} - {formatDateTime(r.endTime).split(" ")[3] + " " + formatDateTime(r.endTime).split(" ")[4]}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick actions for current day */}
                <div className="pt-6 border-t border-surface-lighter mt-6 space-y-2">
                  <Link
                    to={`/vm/block-schedule?venueId=${selectedVenueId}&date=${formatDateISO(selectedDate)}`}
                    className="block w-full text-center"
                  >
                    <Button variant="danger" className="w-full">
                      Block Selected Date
                    </Button>
                  </Link>
                  <Link to="/vm/venues" className="block w-full text-center">
                    <Button variant="secondary" className="w-full">
                      Manage Venues
                    </Button>
                  </Link>
                </div>

              </div>
            </div>
          )}
        </>
      )}

      {/* Batch Configuration Modal */}
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
    </div>
  );
}
