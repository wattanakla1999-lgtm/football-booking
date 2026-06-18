import Image from "next/image";

type AdminRouteLoadingOverlayProps = {
  open: boolean;
};

export function AdminRouteLoadingOverlay({
  open,
}: AdminRouteLoadingOverlayProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="pointer-events-auto fixed inset-0 z-[10000] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="relative flex h-36 w-36 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-white/10" />
        <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-green-300/90 border-r-green-400/70 animate-[spin_1s_linear_infinite]" />
        <div className="absolute inset-3 rounded-full border border-transparent border-b-green-500/70 border-l-emerald-300/80 animate-[spin_1.6s_linear_infinite_reverse]" />
        <div className="absolute inset-5 rounded-full bg-green-500/10 blur-md" />
        <Image
          src="/footbal.png"
          alt=""
          aria-hidden="true"
          width={80}
          height={80}
          className="relative z-10 h-30 w-30 animate-[spin_1.2s_linear_infinite] object-contain drop-shadow-[0_0_18px_rgba(34,197,94,0.45)]"
          priority
        />
      </div>
    </div>
  );
}
