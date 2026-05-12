import { Skeleton } from './ui/skeleton';

/* ─── Admin page skeleton (used with NavSidebar) ─── */
export function AdminPageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="min-h-full animate-pulse" style={{ background: '#f3f6f4' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <Skeleton className="h-5 w-44 mb-2 rounded-lg" />
        <Skeleton className="h-3 w-28 rounded-md" />
      </div>

      <div className="p-6 space-y-4">
        {/* Stat cards row */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>

        {/* Content rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl" style={{ opacity: 1 - i * 0.1 }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Splash / home page skeleton ─── */
export function SplashSkeleton() {
  return (
    <div className="min-h-screen animate-pulse" style={{ background: '#f3f6f4' }}>
      {/* Header */}
      <div
        className="px-8 py-4 flex items-center justify-between"
        style={{ background: 'rgba(255,255,255,0.85)', borderBottom: '1px solid #e5ebe7' }}
      >
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <div>
            <Skeleton className="h-4 w-36 mb-1 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        {/* Hero card */}
        <Skeleton className="h-48 rounded-2xl" />

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Dark / Islamic theme skeleton ─── */
export function DarkPageSkeleton() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 animate-pulse"
      style={{ background: 'linear-gradient(135deg, #040E09 0%, #081C15 100%)' }}
    >
      <Skeleton className="h-8 w-48 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="w-full max-w-2xl px-4 space-y-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton
            key={i}
            className="h-16 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.05)', opacity: 1 - i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Setup page skeleton ─── */
export function SetupSkeleton() {
  return (
    <div className="min-h-screen animate-pulse" style={{ background: '#f3f6f4' }}>
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <div>
          <Skeleton className="h-5 w-40 mb-1 rounded" />
          <Skeleton className="h-3 w-28 rounded" />
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
    </div>
  );
}
