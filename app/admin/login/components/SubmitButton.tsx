import { Button } from "@/src/components/ui";

type SubmitButtonProps = {
  loading: boolean;
};

export function SubmitButton({
  loading,
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant="unstyled"
      loading={loading}
      style={{
        width: "100%",
        padding: "0.875rem",
        borderRadius: "14px",
        border: "none",
        background:
          "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
        color: "var(--color-on-primary)",
        fontSize: "1rem",
        fontWeight: 700,
        cursor: loading
          ? "not-allowed"
          : "pointer",
        opacity: loading ? 0.6 : 1,
        transition: "opacity 0.2s",
        marginTop: "0.5rem",
      }}
    >
      {loading
        ? "กำลังเข้าสู่ระบบ..."
        : "เข้าสู่ระบบ"}
    </Button>
  );
}
