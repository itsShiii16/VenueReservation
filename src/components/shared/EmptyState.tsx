import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  actionLabel,
  onActionClick,
}) => {
  return (
    <Card className="border border-dashed border-zinc-300 bg-white/40 p-8 rounded-xl">
      <CardContent className="flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
        {Icon && (
          <div className="p-3.5 bg-zinc-100 rounded-full text-zinc-400">
            <Icon className="h-8 w-8 stroke-[1.5]" />
          </div>
        )}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-zinc-900">{title}</h3>
          <p className="text-zinc-500 text-xs leading-relaxed">{description}</p>
        </div>
        {actionLabel && onActionClick && (
          <Button onClick={onActionClick} size="sm" className="bg-red-800 hover:bg-red-900 text-white font-bold rounded-lg px-4 mt-2">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
export default EmptyState;
