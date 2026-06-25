import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import Button from "../../components/Button";
import Select from "../../components/Select";
import { venueService } from "../../services/venueService";
import { blockedSlotService } from "../../services/blockedSlotService";
import { useAuth } from "../../hooks/useAuth";
import { formatDateTime } from "../../utils/formatDate";

export default function VenueCalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [venues, setVenues] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState(searchParams.get("venueId") || "");
  const [venueDetails, setVenueDetails] = useState(null);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
      const res = await venueService.getById(selectedVenueId);
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
      // Refresh details
      await fetchVenueDetails();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete blocked slot.");
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

  const selectedDayEvents = getDayEvents(selectedDate);
  const totalSelectedEvents = selectedDayEvents.reservations.length + selectedDayEvents.blockedSlots.length;

  if (loadingVenues) return <LoadingState message="Loading your venue calendars..." />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Venue Calendar"
        subtitle="Manage and view schedules, bookings, and blocked dates for your venues"
      >
        {selectedVenueId && (
          <Link to={`/venue-manager/block-schedule?venueId=${selectedVenueId}&date=${formatDateISO(selectedDate)}`}>
            <Button variant="danger">Block Time Slots</Button>
          </Link>
        )}
      </PageHeader>

      {venues.length === 0 ? (
        <EmptyState
          title="No Venues Found"
          message="You aren't managing any venues yet. Create a venue to view and manage its calendar schedule."
        >
          <Link to="/venue-manager/add-venue">
            <Button>Add a Venue</Button>
          </Link>
        </EmptyState>
      ) : (
        <>
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
                    const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
                    const isToday = today.toDateString() === date.toDateString();

                    return (
                      <button
                        key={`day-${date.getDate()}`}
                        onClick={() => setSelectedDate(date)}
                        className={`aspect-square rounded-lg flex flex-col justify-between p-2 text-left relative transition-all group hover:border-primary/50 border ${
                          isSelected
                            ? "bg-primary/20 border-primary text-white font-bold"
                            : isToday
                            ? "bg-surface-light border-secondary/50 text-secondary"
                            : "bg-surface-light/40 border-surface-lighter text-gray-300"
                        }`}
                      >
                        <span>{date.getDate()}</span>
                        
                        <div className="flex gap-1 mt-auto">
                          {blockedSlots.length > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-danger" title={`${blockedSlots.length} Blocked slot(s)`}></span>
                          )}
                          {reservations.length > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-info" title={`${reservations.length} Reservation(s)`}></span>
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

                  {totalSelectedEvents === 0 ? (
                    <div className="text-center py-8 bg-surface-dark/30 rounded-xl border border-surface-lighter/50">
                      <span className="text-3xl">🟢</span>
                      <p className="text-sm text-gray-300 font-medium mt-2">No Bookings or Blocks</p>
                      <p className="text-xs text-gray-500 mt-1">This day is completely free.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
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
                            <span className="text-xs font-semibold text-info bg-info/20 px-2 py-0.5 rounded">
                              RESERVED
                            </span>
                          </div>
                          <p className="text-sm font-medium text-white">{r.eventTitle}</p>
                          {r.activityType && (
                            <p className="text-xs text-gray-300">{r.activityType}</p>
                          )}
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
                    to={`/venue-manager/block-schedule?venueId=${selectedVenueId}&date=${formatDateISO(selectedDate)}`}
                    className="block w-full text-center"
                  >
                    <Button variant="danger" className="w-full">
                      Block Selected Date
                    </Button>
                  </Link>
                </div>

              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
