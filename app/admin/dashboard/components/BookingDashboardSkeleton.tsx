export function BookingDashboardSkeleton() {
  return (
    <div className="space-y-lg animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-md">
        {Array.from({ length: 6 }).map(
          (_, index) => (
            <div
              key={index}
              className="glass-card rounded-xl h-32 bg-white/5"
            />
          ),
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-lg">
        <div className="xl:col-span-2 glass-card rounded-xl h-96 bg-white/5" />

        <div className="space-y-lg">
          <div className="glass-card rounded-xl h-64 bg-white/5" />
          <div className="glass-card rounded-xl h-56 bg-white/5" />
        </div>
      </div>
    </div>
  );
}
