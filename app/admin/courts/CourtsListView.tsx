"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import CourtsEmptyState from "./components/CourtsEmptyState";
import CourtFormModal from "./components/CourtFormModal";
import CourtsGrid from "./components/CourtsGrid";
import CourtsHeader from "./components/CourtsHeader";
import { useCourtForm } from "./hooks/useCourtForm";
import { PaginationControls } from "@/src/components/common/PaginationControls";
import { LoadingSpinner } from "@/src/components/ui";
import type { PaginationMeta } from "@/src/types/pagination";

import {
  createAdminCourt,
  deleteAdminCourt,
  updateAdminCourt,
} from "@/src/services/adminCourts";

import type {
  Court,
  SaveCourtPayload,
} from "./types/court";

interface CourtsListViewProps {
  initialCourts: Court[];
  pagination: PaginationMeta;
}

export default function CourtsListView({
  initialCourts,
  pagination,
}: CourtsListViewProps) {
  const router = useRouter();
  const [courts] = useState<Court[]>(initialCourts);
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
      router.refresh();
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
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบสนาม");
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();

    if (page > 1) {
      params.set("page", String(page));
    }

    router.push(
      params.size
        ? `/admin/courts?${params.toString()}`
        : "/admin/courts",
    );
  };

  return (
    <div className="space-y-6">
      <CourtsHeader onAddCourt={openAddModal} />

      {submitting && courts.length === 0 ? (
        <LoadingSpinner />
      ) : courts.length === 0 ? (
        <CourtsEmptyState />
      ) : (
        <>
          <CourtsGrid
            courts={courts}
            onEditCourt={openEditModal}
            onDeleteCourt={handleDelete}
          />

          <PaginationControls
            page={pagination.page}
            total={pagination.total}
            limit={pagination.limit}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
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
