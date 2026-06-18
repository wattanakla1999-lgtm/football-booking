import { FeedbackMessage } from "@/src/components/ui";

type FormErrorProps = {
  message: string;
};

export function FormError({
  message,
}: FormErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <FeedbackMessage
      role="alert"
      variant="error"
      style={{
        background: "rgba(239,68,68,0.1)",
        border:
          "1px solid rgba(239,68,68,0.2)",
        color: "#f87171",
        padding: "0.75rem 1rem",
        borderRadius: "12px",
        fontSize: "0.85rem",
        textAlign: "center",
      }}
    >
      {message}
    </FeedbackMessage>
  );
}
