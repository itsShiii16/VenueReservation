'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supplementaryUploadSchema, SupplementaryUploadInput } from '@/lib/validations/reservationSchema';
import { getMockDb } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUploadBox } from '@/components/shared/FileUploadBox';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow, isAfter } from 'date-fns';

interface SupplementaryUploadFormProps {
  reservationId: string;
  onSuccess: () => void;
}

export const SupplementaryUploadForm: React.FC<SupplementaryUploadFormProps> = ({
  reservationId,
  onSuccess,
}) => {
  const router = useRouter();
  const db = getMockDb();
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { name: string; size: number }>>({});
  const [countdown, setCountdown] = useState<string>('');

  const reservation = db.reservations.find((r) => r.id === reservationId);
  const venue = reservation ? db.venues.find((v) => v.id === reservation.venueId) : null;
  
  // Get all requirements for this reservation
  const reqs = db.requirements.filter((req) => req.reservationId === reservationId);
  const supplementaryNames = venue?.supplementaryRequirements || [];
  
  // Filter requirements that need uploading (either missing or returned/needs revision)
  const pendingReqs = reqs.filter(
    (req) => supplementaryNames.includes(req.requirementName) && (req.status === 'Missing' || req.status === 'Needs Revision')
  );

  const completedCount = reqs.filter((req) => req.status === 'Approved' || req.status === 'Uploaded').length;
  const progressPercent = reqs.length > 0 ? Math.round((completedCount / reqs.length) * 100) : 0;

  useEffect(() => {
    if (!reservation?.pencilBookingDeadline) return;

    const timer = setInterval(() => {
      const deadline = new Date(reservation.pencilBookingDeadline!);
      const now = new Date();

      if (isAfter(now, deadline)) {
        setCountdown('Pencil booking period has expired / auto-rejected.');
        clearInterval(timer);
      } else {
        setCountdown(`Pencil booking holds for: ${formatDistanceToNow(deadline)}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [reservation]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<SupplementaryUploadInput>({
    resolver: zodResolver(supplementaryUploadSchema),
    defaultValues: {
      remarks: '',
      files: [],
    },
  });

  const handleFileSelect = (reqId: string, file: { name: string; size: number }) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [reqId]: file,
    }));
    // Hook form needs to know that files array has items
    setValue('files', [file]);
  };

  const handleFileRemove = (reqId: string) => {
    setUploadedFiles((prev) => {
      const copy = { ...prev };
      delete copy[reqId];
      return copy;
    });
  };

  const onSubmit = async (data: SupplementaryUploadInput) => {
    if (!reservation) return;

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update mock requirements in DB
      pendingReqs.forEach((req) => {
        const file = uploadedFiles[req.id];
        if (file) {
          req.status = 'Uploaded';
          req.fileName = file.name;
          req.updatedAt = new Date();
        }
      });

      // Update reservation state
      reservation.status = 'UNDER_REVIEW'; // Back to review once supplementary docs are uploaded
      reservation.updatedAt = new Date();

      // Log action
      db.auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'UPLOAD_SUPPLEMENTARY',
        entityType: 'Reservation',
        entityId: reservationId,
        description: `Uploaded supplementary documents for reservation: "${reservation.eventTitle}"`,
        userId: reservation.clientId,
        createdAt: new Date(),
      });

      db.save();

      toast.success('Supplementary documents uploaded successfully! Reservation is now Under Review.');
      onSuccess();
      router.refresh();
    } catch (e) {
      toast.error('Failed to upload files.');
    }
  };

  if (!reservation || !venue) return <p className="text-zinc-500 italic">Loading reservation details...</p>;

  return (
    <Card className="border border-zinc-200 shadow-sm bg-white rounded-xl overflow-hidden font-sans">
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 mb-1">Upload Supplementary Requirements</h3>
          <p className="text-xs text-zinc-500">
            Submit the remaining documents required by the {venue.managingUnit} to confirm your booking.
          </p>
        </div>

        {/* Countdown Timer Block */}
        {reservation.pencilBookingDeadline && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-center gap-2.5 text-amber-900 text-xs">
            <Clock className="h-4 w-4 text-amber-700 animate-spin shrink-0" />
            <span className="font-semibold">{countdown}</span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-zinc-700 uppercase">
            <span>Document Progress</span>
            <span>{completedCount} / {reqs.length} Approved/Uploaded</span>
          </div>
          <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-red-800 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Submit Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4">
            {pendingReqs.map((req) => (
              <div key={req.id} className="space-y-1.5 p-4 border border-zinc-200 rounded-lg bg-zinc-50/50">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">{req.requirementName}</Label>
                  {req.status === 'Needs Revision' && (
                    <span className="text-[10px] text-orange-700 font-bold bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                      Needs Revision
                    </span>
                  )}
                </div>
                {req.remarks && (
                  <p className="text-xs text-red-700 bg-red-50 p-2 border border-red-100 rounded mb-2">
                    <strong>Revision Note:</strong> {req.remarks}
                  </p>
                )}
                <FileUploadBox
                  selectedFile={uploadedFiles[req.id]}
                  onFileSelect={(file) => handleFileSelect(req.id, file)}
                  onFileRemove={() => handleFileRemove(req.id)}
                />
              </div>
            ))}
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <Label htmlFor="remarks" className="text-xs font-bold text-zinc-700 uppercase">
              Submitter Remarks (Optional)
            </Label>
            <Textarea
              id="remarks"
              placeholder="Add any clarification or notes about these documents..."
              rows={3}
              className="border-zinc-300 rounded-lg text-sm"
              {...register('remarks')}
            />
          </div>

          {/* Submit Action */}
          <Button
            type="submit"
            disabled={isSubmitting || Object.keys(uploadedFiles).length === 0}
            className="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-2.5 rounded-lg shadow-sm"
          >
            {isSubmitting ? 'Uploading files...' : 'Upload & Submit for Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
export default SupplementaryUploadForm;
