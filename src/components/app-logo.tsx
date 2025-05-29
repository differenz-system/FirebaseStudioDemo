import { ListChecks } from 'lucide-react';

export function AppLogo() {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <ListChecks className="h-8 w-8 text-primary" />
      <h1 className="text-2xl font-bold text-primary tracking-tight">TaskZen</h1>
    </div>
  );
}