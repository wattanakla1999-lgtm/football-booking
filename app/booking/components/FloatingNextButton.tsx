import { formatPrice } from "../utils/booking";

type FloatingNextButtonProps = {
  selectedHours: number;
  totalPrice: number;
  onClick: () => void;
};

export function FloatingNextButton({
  selectedHours,
  totalPrice,
  onClick,
}: FloatingNextButtonProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 px-6 pb-6 pt-5 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/90 to-transparent z-10">
      <button
        type="button"
        onClick={onClick}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-5 rounded-2xl shadow-[0_4px_20px_rgba(34,197,94,0.35)] transition-all duration-150 active:scale-[0.98] flex justify-between items-center px-6"
      >
        <span className="flex items-center gap-3">
          <span className="text-base">ดำเนินการต่อ</span>
          <span className="text-green-200 text-xs font-medium bg-white/15 px-3 py-0.5 rounded-full">
            {selectedHours} ชม.
          </span>
        </span>

        <span className="flex items-center gap-2">
          <span className="text-lg font-extrabold">
            ฿{formatPrice(totalPrice)}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </button>
    </div>
  );
}
