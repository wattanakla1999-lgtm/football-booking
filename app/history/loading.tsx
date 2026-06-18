import { BookingSkeleton } from "./components/BookingSkeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0f172a]/90 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-md bg-white/10" />
          <div className="h-6 w-36 rounded-lg bg-white/10" />
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl space-y-5 p-5">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-white/10" />
                <div className="h-3 w-28 rounded bg-white/10" />
              </div>
              <div className="h-8 w-52 rounded-xl bg-white/10" />
              <div className="mt-3 h-4 w-72 rounded bg-white/10" />
            </div>

            <div className="flex items-center gap-3">
              <div className="h-16 w-24 rounded-2xl bg-white/10" />
              <div className="h-12 w-12 rounded-2xl bg-white/10" />
            </div>
          </div>

          <div className="border-t border-white/10 p-5 sm:p-6">
            <div className="h-12 rounded-2xl bg-black/20" />
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-16 rounded-2xl border border-white/10 bg-white/[0.04]"
            />
          ))}
        </div>

        <BookingSkeleton />
      </div>
    </main>
  );
}
