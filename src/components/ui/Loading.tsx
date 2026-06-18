type LoadingSpinnerProps = {
  fullHeight?: boolean;
  className?: string;
};

export function LoadingSpinner({
  fullHeight = false,
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: fullHeight ? "60vh" : undefined,
        padding: fullHeight ? undefined : "3rem",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          border: "4px solid #6366f1",
          borderTopColor: "transparent",
          borderRadius: "50%",
          animation: "spin 0.6s linear infinite",
        }}
      />
    </div>
  );
}
