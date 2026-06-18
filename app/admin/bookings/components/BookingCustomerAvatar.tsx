import Image from "next/image";

interface BookingCustomerAvatarProps {
  pictureUrl: string | null;
  displayName: string;
  isOffline: boolean;
  size?: number;
  radius?: string;
  fontSize?: string;
}

export default function BookingCustomerAvatar({
  pictureUrl,
  displayName,
  isOffline,
  size = 34,
  radius = "10px",
  fontSize = "0.8rem",
}: BookingCustomerAvatarProps) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: radius,
        background: isOffline ? "rgba(245,158,11,0.1)" : "rgba(99,102,241,0.1)",
        border: `1px solid ${isOffline ? "rgba(245,158,11,0.2)" : "rgba(99,102,241,0.2)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize,
        flexShrink: 0,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {pictureUrl ? (
        <Image
          src={pictureUrl}
          alt={displayName}
          fill
          sizes={`${size}px`}
          style={{ objectFit: "cover" }}
        />
      ) : (
        isOffline ? "📞" : "👤"
      )}
    </div>
  );
}
