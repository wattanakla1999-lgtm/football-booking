import type { Court } from "../types/booking";
import { formatPrice } from "../utils/booking";

type CourtCardProps = {
  court: Court;
  onSelect: (court: Court) => void;
};

export function CourtCard({ court, onSelect }: CourtCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(court)}
      className="group w-full text-left bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.06] hover:border-green-500/30 transition-all duration-200 active:scale-[0.99]"
    >
      <div className="flex min-h-[5.5rem]">
        <div className="w-[130px] shrink-0 relative bg-gradient-to-br from-green-900/40 to-black/70">
          {court.images?.[0]?.url ? (
            <img
              src={court.images[0].url}
              alt={court.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">⚽</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 px-5 py-4 flex flex-col justify-center">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-lg tracking-tight">{court.name}</h3>
            <div className="shrink-0 bg-green-500/15 text-green-400 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
              ฿{formatPrice(court.pricePerHour)}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2.5 text-sm text-white/40">
            {court.surface && <span>🌿 {court.surface}</span>}
            {court.maxPlayers && <span>👥 {court.maxPlayers} คน</span>}
            <span>⏱️ 1 ชม.</span>
          </div>
        </div>

        <div className="flex items-center pr-5 text-white/20 group-hover:text-green-400 transition-colors">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </button>
  );
}
