import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import Button from "../../components/Button";
import Select from "../../components/Select";
import { venueService } from "../../services/venueService";
import { useAuth } from "../../hooks/useAuth";
import { formatDateTime } from "../../utils/formatDate";

export default function CalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  
  const [venues, setVenues] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState(searchParams.get("venueId") || "");
  const [venueDetails, setVenueDetails] = useState(null);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Calendar navigation state
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState(today);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Fetch all venues
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await venueService.getAll();
        if (res.success) {
          setVenues(res.data || []);
        }
      } catch (err) {
        console.error("Error fetching venues:", err);
      } finally {
        setLoadingVenues(false);
      }
    };
    fetchVenues();
  }, []);

  // Sync selectedVenueId from search param
  useEffect(() => {
    const paramId = searchParams.get("venueId");
    if (paramId && paramId !== selectedVenueId) {
      setSelectedVenueId(paramId);
    }
  }, [searchParams]);

  // Fetch venue details (blocked slots & reservations) when selectedVenueId changes
  useEffect(() => {
    if (!selectedVenueId) {
      setVenueDetails(null);
      return;
    }
    const fetchDetails = async () => {
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
    fetchDetails();
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

  // Calendar grid calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // Sun = 0

  const daysArray = [];
  // Pre-fill empty slots for previous month offset
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  // Fill month days
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(new Date(currentYear, currentMonth, i));
  }

  // Get events on a specific day
  const getDayEvents = (date) => {
    if (!date || !venueDetails) return { reservations: [], blockedSlots: [] };
    
    const formattedDateStr = date.toDateString();

    const reservations = (venueDetails.reservations || []).filter((r) => {
      const rStart = new Date(r.startTime);
      const rEnd = new Date(r.endTime);
      
      // Zero out time part for day matching
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

  // Format a simple date as YYYY-MM-DD
  const formatDateISO = (date) => {
    if (!date) return "";
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
  };

  // Get selected day events
  const selectedDayEvents = getDayEvents(selectedDate);
  const totalSelectedEvents = selectedDayEvents.reservations.length + selectedDayEvents.blockedSlots.length;

  if (loadingVenues) return <LoadingState message="Loading availability calendar..." />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Availability Calendar"
        subtitle="Browse existing bookings and blocked slots to find the perfect time for your event"
      />

      {/* Venue Selector */}
      <div className="max-w-md bg-surface border border-surface-lighter rounded-xl p-4">
        <Select
          id="calendar-venue-select"
          label="Select Venue"
          value={selectedVenueId}
          onChange={handleVenueChange}
          options={venues.map((v) => ({ value: v.id, label: `${v.name} (${v.location})` }))}
          placeholder="Choose a venue..."
        />
      </div>

      {!selectedVenueId ? (
        <EmptyState
          title="Select a Venue"
          message="Please choose a venue from the dropdown menu above to see its availability and schedule details."
        />
      ) : loadingDetails ? (
        <LoadingState message="Fetching schedules..." />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Calendar Grid Container */}
          <div className="lg:col-span-2 bg-surface border border-surface-lighter rounded-2xl p-6">
            
            {/* Calendar Month Header */}
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

            {/* Weekday Names */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-400 mb-2">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Month Day Cells */}
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
                    
                    {/* Event Dots */}
                    <div className="flex gap-1 mt-auto">
                      {blockedSlots.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-danger" title={`${blockedSlots.length} Blocked slot(s)`}></span>
                      )}
                      {reservations.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-info" title={`${reservations.length} Approved Reservation(s)`}></span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Detail drawer */}
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
                  <p className="text-sm text-gray-300 font-medium mt-2">Fully Available</p>
                  <p className="text-xs text-gray-500 mt-1">No reservations or blocks on this date.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {/* Blocked slots list */}
                  {selectedDayEvents.blockedSlots.map((b) => (
                    <div key={b.id} className="p-3 bg-danger/10 border border-danger/30 rounded-xl space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-danger bg-danger/20 px-2 py-0.5 rounded">
                          BLOCKED
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white">{b.reason || "Maintenance / Event setup"}</p>
                      <p className="text-xs text-gray-400">
                        {formatDateTime(b.startTime).split(" ")[3] + " " + formatDateTime(b.startTime).split(" ")[4]} - {formatDateTime(b.endTime).split(" ")[3] + " " + formatDateTime(b.endTime).split(" ")[4]}
                      </p>
                    </div>
                  ))}

                  {/* Approved reservations list */}
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

            {/* Quick Action Button */}
            <div className="pt-6 border-t border-surface-lighter mt-6">
              {isAuthenticated ? (
                user.role === "CLIENT" ? (
                  <Link
                    to={`/reserve?venueId=${selectedVenueId}&date=${formatDateISO(selectedDate)}`}
                    className="block w-full text-center"
                  >
                    <Button className="w-full">
                      Book on This Date
                    </Button>
                  </Link>
                ) : (
                  <p className="text-xs text-center text-gray-400">
                    Only Clients can submit reservation requests. Your current role is <span className="font-semibold text-primary">{user.role}</span>.
                  </p>
                )
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-xs text-gray-400">Want to book this date?</p>
                  <Link to="/login" className="block">
                    <Button variant="secondary" className="w-full">
                      Log In to Reserve
                    </Button>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
