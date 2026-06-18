"use client";

import { useState } from "react";

import CourtsEmptyState from "./components/CourtsEmptyState";
import CourtFormModal from "./components/CourtFormModal";
import CourtsGrid from "./components/CourtsGrid";
import CourtsHeader from "./components/CourtsHeader";
import { useCourtForm } from "./hooks/useCourtForm";
import { LoadingSpinner } from "@/src/components/ui";

import {
  createAdminCourt,
  deleteAdminCourt,
  fetchAdminCourts,
  updateAdminCourt,
} from "@/src/services/adminCourts";

import type {
  Court,
  SaveCourtPayload,
} from "./types/court";

interface CourtsListViewProps {
  initialCourts: Court[];
}

export default function CourtsListView({
  initialCourts,
}: CourtsListViewProps) {
  const [courts, setCourts] = useState<Court[]>(initialCourts);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    showModal,
    editingCourt,
    formValues,
    error,
    setError,
    openAddModal,
    openEditModal,
    closeModal,
    updateField,
  } = useCourtForm();

  const fetchCourts = async () => {
    setLoading(true);
    try {
      const nextCourts = await fetchAdminCourts();
      setCourts(nextCourts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.name || !formValues.pricePerHour) {
      setError("กรุณากรอกชื่อสนามและราคา");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload: SaveCourtPayload = {
        courtId: editingCourt?.id,
        name: formValues.name,
        pricePerHour: formValues.pricePerHour,
        maxPlayers: formValues.maxPlayers ? parseInt(formValues.maxPlayers) : null,
        surface: formValues.surface,
        imageUrl: formValues.imageUrl,
        description: formValues.description,
        isActive: formValues.isActive,
      };

      if (editingCourt) {
        await updateAdminCourt({
          ...payload,
          courtId: editingCourt.id,
        });
      } else {
        await createAdminCourt(payload);
      }

      alert("บันทึกข้อมูลสนามบอลสำเร็จ!");
      closeModal();
      await fetchCourts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (courtId: string, courtName: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบสนาม "${courtName}"?`)) return;

    try {
      await deleteAdminCourt(courtId);
      alert("ลบสนามบอลสำเร็จ!");
      await fetchCourts();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบสนาม");
    }
  };

  return (
    <div>
      <CourtsHeader onAddCourt={openAddModal} />

      {loading ? (
        <LoadingSpinner />
      ) : courts.length === 0 ? (
        <CourtsEmptyState />
      ) : (
        <CourtsGrid
          courts={courts}
          onEditCourt={openEditModal}
          onDeleteCourt={handleDelete}
        />
      )}

      {showModal && (
        <CourtFormModal
          editingCourt={editingCourt}
          formValues={formValues}
          error={error}
          submitting={submitting}
          onFieldChange={updateField}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
