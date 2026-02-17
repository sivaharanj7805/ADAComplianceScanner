import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}
