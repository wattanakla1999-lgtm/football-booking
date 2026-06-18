import type { FormEvent } from "react";

import {
  Button,
  FeedbackMessage,
  FormField,
  Input,
  Label,
  Modal,
  Textarea,
} from "@/src/components/ui";
import type {
  Court,
  CourtFormValues,
} from "../types/court";

interface CourtFormModalProps {
  editingCourt: Court | null;
  formValues: CourtFormValues;
  error: string;
  submitting: boolean;
  onFieldChange: <Key extends keyof CourtFormValues>(
    field: Key,
    value: CourtFormValues[Key]
  ) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function CourtFormModal({
  editingCourt,
  formValues,
  error,
  submitting,
  onFieldChange,
  onClose,
  onSubmit,
}: CourtFormModalProps) {
  return (
    <Modal
      contentClassName="max-w-[480px]"
      className=""
    >
      <div
        style={{
          padding: "1.75rem",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "0.4rem", color: "#ffffff" }}>
          {editingCourt ? "📝 แก้ไขข้อมูลสนามฟุตบอล" : "⚽ เพิ่มสนามฟุตบอลใหม่"}
        </h3>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", marginBottom: "1.25rem" }}>
          กรอกข้อมูลสนามเพื่อนำเสนอในระบบและเปิดรับจอง
        </p>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <FormField id="courtName" label="ชื่อสนามบอล *">
            <Input
              id="courtName"
              type="text"
              required
              placeholder="เช่น Pitch 1 (Standard)"
              value={formValues.name}
              onChange={(event) =>
                onFieldChange("name", event.target.value)
              }
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <FormField id="courtPrice" label="ราคาต่อชั่วโมง (บาท) *">
              <Input
                id="courtPrice"
                type="number"
                required
                placeholder="เช่น 1000"
                value={formValues.pricePerHour}
                onChange={(event) =>
                  onFieldChange("pricePerHour", event.target.value)
                }
              />
            </FormField>

            <FormField id="courtMaxPlayers" label="จำนวนผู้เล่นสูงสุด (คน)">
              <Input
                id="courtMaxPlayers"
                type="number"
                placeholder="เช่น 14"
                value={formValues.maxPlayers}
                onChange={(event) =>
                  onFieldChange("maxPlayers", event.target.value)
                }
              />
            </FormField>
          </div>

          <FormField id="courtSurface" label="ประเภทพื้นสนาม">
            <Input
              id="courtSurface"
              type="text"
              placeholder="เช่น หญ้าเทียม (Artificial Grass)"
              value={formValues.surface}
              onChange={(event) =>
                onFieldChange("surface", event.target.value)
              }
            />
          </FormField>

          <FormField id="courtImageUrl" label="ลิงก์รูปภาพสนาม (URL)">
            <Input
              id="courtImageUrl"
              type="text"
              placeholder="ลิงก์ URL รูปภาพ เช่น Unsplash"
              value={formValues.imageUrl}
              onChange={(event) =>
                onFieldChange("imageUrl", event.target.value)
              }
            />
          </FormField>

          <FormField id="courtDescription" label="รายละเอียดเพิ่มเติม">
            <Textarea
              id="courtDescription"
              placeholder="เช่น สนามพร้อมหลังคากันฝน ไฟสปอร์ตไลท์อย่างดี..."
              value={formValues.description}
              onChange={(event) =>
                onFieldChange("description", event.target.value)
              }
              rows={3}
            />
          </FormField>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Input
              type="checkbox"
              id="isActiveToggle"
              checked={formValues.isActive}
              onChange={(event) =>
                onFieldChange("isActive", event.target.checked)
              }
              style={{
                width: "18px",
                height: "18px",
                accentColor: "var(--color-primary)",
                cursor: "pointer",
              }}
            />
            <Label htmlFor="isActiveToggle" className="" style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", cursor: "pointer" }}>
              เปิดให้บริการสนามนี้ในระบบทันที
            </Label>
          </div>

          {error && (
            <FeedbackMessage
              withIcon
              style={{
                fontSize: "0.75rem",
                padding: "0.6rem",
                borderRadius: "8px",
              }}
            >
              {error}
            </FeedbackMessage>
          )}

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <Button
              type="button"
              onClick={onClose}
              disabled={submitting}
              variant="secondary"
              style={{ flex: 1, padding: "0.7rem" }}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              loading={submitting}
              style={{
                flex: 1,
                padding: "0.7rem",
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
                border: "none",
                boxShadow: "0 4px 12px rgba(6, 199, 85, 0.2)",
              }}
            >
              {submitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
