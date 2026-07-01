import React from 'react';
import { Separator } from '@/components/ui/separator';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action }) => {
  return (
    <div className="space-y-4 mb-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">{title}</h1>
          {description && <p className="text-sm text-zinc-500 font-medium leading-normal">{description}</p>}
        </div>
        {action && <div className="shrink-0 flex items-center">{action}</div>}
      </div>
      <Separator className="bg-zinc-200" />
    </div>
  );
};
export default PageHeader;
