import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadBoxProps {
  onFileSelect: (file: { name: string; size: number; type: string }) => void;
  onFileRemove: () => void;
  selectedFile?: { name: string; size: number } | null;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export const FileUploadBox: React.FC<FileUploadBoxProps> = ({
  onFileSelect,
  onFileRemove,
  selectedFile = null,
  accept = '.pdf,.doc,.docx,.png,.jpg',
  maxSizeMB = 5,
  className,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    setError(null);
    
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File is too large. Max size is ${maxSizeMB}MB.`);
      return;
    }

    onFileSelect({
      name: file.name,
      size: file.size,
      type: file.type,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleTriggerSelect = () => {
    fileInputRef.current?.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-2 w-full', className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleTriggerSelect}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 bg-zinc-50/50 hover:bg-zinc-50 border-zinc-300 hover:border-red-400 group',
            isDragOver && 'border-red-500 bg-red-50/30'
          )}
        >
          <Upload className="h-10 w-10 text-zinc-400 group-hover:text-red-700 transition-colors mb-3 stroke-[1.5]" />
          <p className="text-sm font-semibold text-zinc-800">Drag and drop file here, or click to browse</p>
          <p className="text-xs text-zinc-400 mt-1">Accepted types: {accept.replace(/\./g, ' ').toUpperCase()}</p>
          <p className="text-xs text-zinc-400">Maximum size: {maxSizeMB}MB</p>
        </div>
      ) : (
        <div className="border border-zinc-200 rounded-lg p-4 bg-white flex items-center justify-between shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-red-50 rounded-lg">
              <FileText className="h-6 w-6 text-red-700" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-900 truncate pr-4">{selectedFile.name}</p>
              {'size' in selectedFile && typeof selectedFile.size === 'number' && (
                <p className="text-xs text-zinc-500">{formatSize(selectedFile.size)}</p>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onFileRemove();
            }}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-red-600 text-xs mt-1 animate-in slide-in-from-top-1 duration-200">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
export default FileUploadBox;
