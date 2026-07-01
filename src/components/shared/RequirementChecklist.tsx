import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Clock, FileText, Upload, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RequirementItem {
  id: string;
  name: string;
  status: 'Missing' | 'Uploaded' | 'Needs Revision' | 'Approved';
  fileName?: string;
  remarks?: string;
}

interface RequirementChecklistProps {
  requirements: RequirementItem[];
  onUpload?: (reqName: string) => void;
  onView?: (req: RequirementItem) => void;
  onStatusChange?: (reqId: string, status: RequirementItem['status'], remarks?: string) => void;
  readOnly?: boolean;
  isManager?: boolean;
}

export const RequirementChecklist: React.FC<RequirementChecklistProps> = ({
  requirements,
  onUpload,
  onView,
  onStatusChange,
  readOnly = false,
  isManager = false,
}) => {
  const getStatusBadge = (status: RequirementItem['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1.5 font-sans font-medium py-1">
            <CheckCircle className="h-3.5 w-3.5" /> Approved
          </Badge>
        );
      case 'Uploaded':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1.5 font-sans font-medium py-1">
            <FileText className="h-3.5 w-3.5" /> Uploaded
          </Badge>
        );
      case 'Needs Revision':
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-300 flex items-center gap-1.5 font-sans font-medium py-1">
            <AlertCircle className="h-3.5 w-3.5" /> Needs Revision
          </Badge>
        );
      case 'Missing':
      default:
        return (
          <Badge className="bg-gray-100 text-gray-400 border-gray-200 flex items-center gap-1.5 font-sans font-medium py-1">
            <Clock className="h-3.5 w-3.5" /> Missing
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {requirements.length === 0 ? (
        <p className="text-zinc-500 text-sm italic">No requirements specified for this venue.</p>
      ) : (
        <div className="grid gap-3">
          {requirements.map((req) => (
            <Card key={req.id} className="shadow-none border border-zinc-200 bg-white">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-semibold text-zinc-900 text-sm">{req.name}</h4>
                  {req.fileName ? (
                    <div className="flex items-center gap-1.5 text-zinc-600 text-xs font-mono">
                      <FileText className="h-3.5 w-3.5 text-zinc-400" />
                      {req.fileName}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 italic">No document uploaded yet</p>
                  )}
                  {req.remarks && (
                    <div className="mt-2 text-xs bg-red-50 text-red-700 p-2 rounded-md border border-red-100 font-sans">
                      <span className="font-bold">Remarks:</span> {req.remarks}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-2 sm:self-center">
                  {getStatusBadge(req.status)}

                  {!readOnly && (
                    <>
                      {/* Client Actions */}
                      {!isManager && (req.status === 'Missing' || req.status === 'Needs Revision') && onUpload && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpload(req.name)}
                          className="h-8 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-700"
                        >
                          <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload
                        </Button>
                      )}

                      {/* Common View Action */}
                      {req.status !== 'Missing' && onView && (
                        <Button size="sm" variant="ghost" onClick={() => onView(req)} className="h-8 text-zinc-600">
                          <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                        </Button>
                      )}

                      {/* Manager Decision Actions */}
                      {isManager && req.status === 'Uploaded' && onStatusChange && (
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            className="bg-green-700 hover:bg-green-800 text-white h-8"
                            onClick={() => onStatusChange(req.id, 'Approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8"
                            onClick={() => {
                              const remarks = prompt('Enter reason for revision:');
                              if (remarks !== null) {
                                onStatusChange(req.id, 'Needs Revision', remarks);
                              }
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
export default RequirementChecklist;
