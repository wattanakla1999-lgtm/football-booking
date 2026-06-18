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
        <Image
          src="/footbal.png"
          alt=""
          aria-hidden="true"
          width={80}
          height={80}
          className="h-30 w-30 animate-[spin_1.2s_linear_infinite] object-contain"
          priority
        />
    </div>
  );
}
