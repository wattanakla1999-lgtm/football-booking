import { FeedbackMessage } from "@/src/components/ui";

type OperatingHoursFeedbackProps = {
  message: string;
  error: string;
};

export function OperatingHoursFeedback({
  message,
  error,
}: OperatingHoursFeedbackProps) {
  return (
    <>
      {message && (
        <FeedbackMessage
          variant="success"
          style={{
            marginBottom: "1rem",
          }}
        >
          {message}
        </FeedbackMessage>
      )}

      {error && (
        <FeedbackMessage
          variant="error"
          withIcon
          style={{
            marginBottom: "1rem",
          }}
        >
          {error}
        </FeedbackMessage>
      )}
    </>
  );
}
