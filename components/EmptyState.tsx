import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-white rounded-lg border border-dashed">
      <Icon className="h-12 w-12 mb-4 opacity-20" />
      <p className="text-lg font-medium text-slate-900">{title}</p>
      <p className="text-sm">{description}</p>
    </div>
  );
}
