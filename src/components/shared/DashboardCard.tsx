import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color?: 'maroon' | 'teal' | 'orange' | 'zinc' | 'blue';
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  color = 'maroon',
  className,
}) => {
  const colorStyles = {
    maroon: 'text-red-800 border-red-200 bg-red-50/50 hover:bg-red-50/80',
    teal: 'text-teal-700 border-teal-200 bg-teal-50/50 hover:bg-teal-50/80',
    orange: 'text-orange-700 border-orange-200 bg-orange-50/50 hover:bg-orange-50/80',
    zinc: 'text-zinc-700 border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50/80',
    blue: 'text-blue-700 border-blue-200 bg-blue-50/50 hover:bg-blue-50/80',
  };

  const iconColors = {
    maroon: 'bg-red-100 text-red-800',
    teal: 'bg-teal-100 text-teal-700',
    orange: 'bg-orange-100 text-orange-700',
    zinc: 'bg-zinc-200 text-zinc-700',
    blue: 'bg-blue-100 text-blue-700',
  };

  return (
    <Card className={cn('transition-all duration-300 border shadow-sm hover:shadow-md hover:scale-[1.01] rounded-xl', colorStyles[color], className)}>
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">{title}</p>
          <p className="text-3xl font-extrabold text-zinc-900 tracking-tight">{value}</p>
          {description && <p className="text-xs text-zinc-400 font-medium">{description}</p>}
        </div>
        <div className={cn('p-3.5 rounded-lg flex items-center justify-center shadow-sm', iconColors[color])}>
          <Icon className="h-6 w-6 stroke-[2]" />
        </div>
      </CardContent>
    </Card>
  );
};
export default DashboardCard;
