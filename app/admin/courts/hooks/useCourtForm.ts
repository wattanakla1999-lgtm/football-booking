import { useState } from "react";

import type {
  Court,
  CourtFormValues,
} from "../types/court";

export const DEFAULT_COURT_IMAGE_URL =
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop";

const defaultFormValues = (): CourtFormValues => ({
  name: "",
  pricePerHour: "",
  maxPlayers: "",
  surface: "Artificial Grass",
  imageUrl: DEFAULT_COURT_IMAGE_URL,
  description: "",
  isActive: true,
});

function getEditFormValues(court: Court): CourtFormValues {
  return {
    name: court.name,
    pricePerHour: String(court.pricePerHour),
    maxPlayers: court.maxPlayers ? court.maxPlayers.toString() : "",
    surface: court.surface || "",
    imageUrl: court.images[0]?.url || "",
    description: court.description || "",
    isActive: court.isActive,
  };
}

export function useCourtForm() {
  const [showModal, setShowModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [formValues, setFormValues] = useState<CourtFormValues>(defaultFormValues);
  const [error, setError] = useState("");

  const openAddModal = () => {
    setEditingCourt(null);
    setFormValues(defaultFormValues());
    setError("");
    setShowModal(true);
  };

  const openEditModal = (court: Court) => {
    setEditingCourt(court);
    setFormValues(getEditFormValues(court));
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setError("");
  };

  const updateField = <Key extends keyof CourtFormValues>(
    field: Key,
    value: CourtFormValues[Key]
  ) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return {
    showModal,
    setShowModal,
    editingCourt,
    formValues,
    error,
    setError,
    openAddModal,
    openEditModal,
    closeModal,
    updateField,
  };
}
