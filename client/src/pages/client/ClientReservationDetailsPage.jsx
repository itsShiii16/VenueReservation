import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { reservationService } from "../../services/reservationService";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatusBadge from "../../components/StatusBadge";
import LoadingState from "../../components/LoadingState";
import { formatDateTime } from "../../utils/formatDate";
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  UploadCloud, 
  Clock, 
  ArrowLeft, 
  XCircle,
  AlertTriangle,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

export default function ClientReservationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingReqId, setUploadingReqId] = useState(null);
  const [mockFileName, setMockFileName] = useState("");

  const fetchReservation = async () => {
    try {
      const res = await reservationService.getById(id);
      setReservation(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reservation details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservation();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this reservation request?")) return;
    try {
      await reservationService.cancel(id);
      toast.success("Reservation request cancelled.");
      fetchReservation();
    } catch (err) {
      toast.error("Failed to cancel reservation.");
    }
  };

  const handleUploadPlaceholder = async (reqId) => {
    if (!mockFileName.trim()) {
      toast.error("Please enter a file name.");
      return;
    }

    try {
      await reservationService.updateRequirement(id, reqId, "Uploaded", "", mockFileName);
      toast.success("Document uploaded successfully!");
      setUploadingReqId(null);
      setMockFileName("");
      fetchReservation();
    } catch (err) {
      toast.error("Upload failed.");
    }
  };

  if (loading) return <LoadingState message="Loading reservation details..." />;
  if (!reservation) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-gray-200">Reservation not found.</h2>
        <Link to="/my-reservations" className="text-primary mt-2 inline-block hover:underline">
          Back to My Reservations
        </Link>
      </div>
    );
  }

  const isDraft = reservation.status === "DRAFT";
  const canCancel = ["DRAFT", "SUBMITTED", "UNDER_REVIEW"].includes(reservation.status);

  // Status-specific visual highlights
  const statusStyles = {
    DRAFT: "bg-zinc-100 text-zinc-800 border-zinc-200",
    SUBMITTED: "bg-blue-50 text-blue-800 border-blue-200",
    UNDER_REVIEW: "bg-amber-50 text-amber-800 border-amber-200",
    APPROVED: "bg-green-50 text-green-800 border-green-200",
    DECLINED: "bg-red-50 text-red-800 border-red-200",
    CANCELLED: "bg-zinc-100 text-zinc-500 border-zinc-200",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link to="/my-reservations" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-red-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My Reservations
        </Link>
      </div>

      {/* Hero card */}
      <div className="bg-surface border border-surface-lighter rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">{reservation.eventTitle}</h1>
            <p className="text-sm text-zinc-500 mt-1">Ref: <span className="font-mono text-zinc-600">{reservation.referenceNumber}</span></p>
          </div>
          <div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusStyles[reservation.status] || "bg-zinc-100"}`}>
              {reservation.status === "DRAFT" ? "PENCIL BOOKING (DRAFT)" : reservation.status}
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm border-t border-b border-surface-lighter py-6">
          <div>
            <span className="text-zinc-500 block">Venue</span>
            <span className="font-semibold text-gray-100">{reservation.venue?.name}</span>
            <span className="text-xs text-zinc-400 block mt-0.5">{reservation.venue?.location}</span>
          </div>
          <div>
            <span className="text-zinc-500 block">Date & Time</span>
            <span className="font-semibold text-gray-100">{formatDateTime(reservation.startTime).split(" ").slice(0, 3).join(" ")}</span>
            <span className="text-xs text-zinc-400 block mt-0.5">
              {formatDateTime(reservation.startTime).split(" ")[3] + " " + formatDateTime(reservation.startTime).split(" ")[4]} - {formatDateTime(reservation.endTime).split(" ")[3] + " " + formatDateTime(reservation.endTime).split(" ")[4]}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block">Activity & Attendees</span>
            <span className="font-semibold text-gray-100">{reservation.activityType}</span>
            <span className="text-xs text-zinc-400 block mt-0.5">{reservation.expectedAttendees} expected attendees</span>
          </div>
        </div>

        {reservation.notes && (
          <div className="text-sm">
            <span className="text-zinc-500 font-medium">Notes:</span>
            <p className="text-zinc-300 mt-1 bg-surface-light p-3 rounded-lg border border-surface-lighter">{reservation.notes}</p>
          </div>
        )}

        {reservation.declineReason && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm flex gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Decline Reason:</span>
              <p className="mt-1">{reservation.declineReason}</p>
            </div>
          </div>
        )}
      </div>

      {/* Pencil Booking Alert banner */}
      {isDraft && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm flex gap-3 items-center">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
          <div className="flex-1">
            <span className="font-bold">Hold Period Active</span>
            <p className="mt-0.5">This is a pencil booking. Please upload all required documents below. Once uploaded, your request will automatically change to <strong>Submitted</strong> status for review.</p>
          </div>
        </div>
      )}

      {/* Payment Pending Alert banner */}
      {reservation.paymentStatus === "Pending" && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 text-sm flex gap-3 items-center">
          <DollarSign className="w-5 h-5 flex-shrink-0 text-blue-600" />
          <div className="flex-1">
            <span className="font-bold">Payment Action Required</span>
            <p className="mt-0.5">Your documents have been approved! Please settle the venue rental fees at the cashier. The Venue Manager will mark this booking as fully Booked once payment confirmation is received.</p>
          </div>
        </div>
      )}

      {/* Payment Overdue Alert banner */}
      {reservation.paymentStatus === "Overdue" && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm flex gap-3 items-center">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <div className="flex-1">
            <span className="font-bold">Payment Overdue</span>
            <p className="mt-0.5">The payment deadline for this reservation has passed. Please contact the Venue Manager immediately to prevent slot cancellation.</p>
          </div>
        </div>
      )}

      {/* Requirement Tracking section */}
      <div className="bg-surface border border-surface-lighter rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-800" /> Requirement Checklist
          </h2>
          <p className="text-sm text-zinc-500 mt-1">Upload the required documents to progress your reservation request.</p>
        </div>

        <div className="divide-y divide-surface-lighter">
          {reservation.requirements?.map((req) => {
            const isUploading = uploadingReqId === req.id;

            return (
              <div key={req.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-semibold text-gray-100 flex items-center gap-2">
                    {req.status === "Approved" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : req.status === "Needs Revision" ? (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    ) : req.status === "Uploaded" ? (
                      <Clock className="w-4 h-4 text-blue-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-zinc-500" />
                    )}
                    {req.name}
                  </span>
                  
                  {req.fileName && (
                    <p className="text-xs text-zinc-400">Uploaded: <span className="font-mono">{req.fileName}</span></p>
                  )}

                  {req.status === "Needs Revision" && req.remarks && (
                    <div className="text-xs text-red-800 bg-red-50 p-2.5 rounded-lg border border-red-200 mt-1">
                      <span className="font-bold block">Revision Request:</span>
                      {req.remarks}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Status label */}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded
                    ${req.status === "Approved" ? "bg-green-50 text-green-800" :
                      req.status === "Uploaded" ? "bg-blue-50 text-blue-800" :
                      req.status === "Needs Revision" ? "bg-red-50 text-red-800" :
                      "bg-zinc-100 text-zinc-400"}`}
                  >
                    {req.status}
                  </span>

                  {/* Upload button for Client */}
                  {["Missing", "Needs Revision"].includes(req.status) && !isUploading && (
                    <Button size="sm" variant="outline" onClick={() => setUploadingReqId(req.id)}>
                      <UploadCloud className="w-3.5 h-3.5 mr-1" /> Upload
                    </Button>
                  )}
                </div>

                {/* Upload Modal Drawer inline */}
                {isUploading && (
                  <div className="w-full md:w-auto flex items-center gap-2 mt-2 md:mt-0">
                    <input
                      type="text"
                      placeholder="Enter filename (e.g., letter.pdf)"
                      value={mockFileName}
                      onChange={(e) => setMockFileName(e.target.value)}
                      className="bg-surface-light border border-surface-lighter text-sm text-gray-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-red-800"
                    />
                    <Button size="sm" onClick={() => handleUploadPlaceholder(req.id)}>Submit</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setUploadingReqId(null); setMockFileName(""); }}>Cancel</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      {canCancel && (
        <div className="flex justify-end pt-4">
          <Button variant="danger" onClick={handleCancel}>
            Cancel Reservation Request
          </Button>
        </div>
      )}
    </div>
  );
}
