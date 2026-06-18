import type { BookingUser, Court } from "../types/booking";
import { CourtCard } from "./CourtCard";

type CourtSelectionStepProps = {
  user: BookingUser;
  courts: Court[];
  loading: boolean;
  error: string;
  onSelectCourt: (court: Court) => void;
};

export function CourtSelectionStep({
  user,
  courts,
  loading,
  error,
  onSelectCourt,
}: CourtSelectionStepProps) {
  return (
    <div className="animate-[slideUp_0.3s_ease-out] py-2">
      <div className="border-l-4 border-green-500 pl-4 mb-6 mt-1">
        <h2 className="text-2xl font-extrabold tracking-tight">เลือกสนาม</h2>
        <p className="text-white/40 text-sm mt-1.5 leading-relaxed">
          สวัสดีคุณ{user.displayName} · มี {loading ? "..." : courts.length} สนามให้เลือก
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[140px] rounded-2xl bg-white/[0.03] animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-500/10 rounded-2xl text-red-400 text-center py-10 px-6 text-sm">
          {error}
        </div>
      ) : courts.length === 0 ? (
        <div className="bg-white/[0.02] rounded-2xl text-center py-14 px-6">
          <div className="text-4xl mb-3">🏟️</div>
          <p className="text-white/40 text-sm">ยังไม่มีสนามที่เปิดให้บริการ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courts.map((court) => (
            <CourtCard
              key={court.id}
              court={court}
              onSelect={onSelectCourt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
