export function BookingSkeleton() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_ , index : number) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
        >
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10" />

              <div>
                <div className="h-4 w-28 rounded bg-white/10" />
                <div className="mt-2 h-3 w-20 rounded bg-white/10" />
              </div>
            </div>

            <div className="h-7 w-20 rounded-lg bg-white/10" />
          </div>

          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="h-16 rounded-xl bg-white/10" />
              <div className="h-16 rounded-xl bg-white/10" />
            </div>

            <div className="h-28 rounded-xl bg-white/10" />

            <div className="flex items-end justify-between">
              <div>
                <div className="h-3 w-24 rounded bg-white/10" />
                <div className="mt-2 h-3 w-32 rounded bg-white/10" />
              </div>

              <div className="h-7 w-24 rounded bg-white/10" />
            </div>
          </div>

          <div className="h-16 border-t border-white/10 bg-white/[0.02]" />
        </div>
      ))}
    </div>
  );
}
