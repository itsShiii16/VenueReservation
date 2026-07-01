import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'destructive' | 'maroon';
  children?: React.ReactNode;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmText = 'Continue',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  children,
}) => {
  const confirmButtonClass = cn(
    buttonVariants({
      variant: variant === 'destructive' ? 'destructive' : 'default',
    }),
    variant === 'maroon' && 'bg-red-800 hover:bg-red-900 text-white border-red-900'
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-xl border border-zinc-200 bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-zinc-900 font-bold">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-500 text-sm font-normal">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {children && <div className="py-2">{children}</div>}
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel onClick={onCancel} className="rounded-lg text-zinc-700 hover:bg-zinc-100">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={cn(confirmButtonClass, 'rounded-lg')}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default ConfirmDialog;
