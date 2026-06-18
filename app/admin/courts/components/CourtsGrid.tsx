import CourtCard from "./CourtCard";

import type { Court } from "../types/court";

interface CourtsGridProps {
  courts: Court[];
  onEditCourt: (court: Court) => void;
  onDeleteCourt: (courtId: string, courtName: string) => void;
}

export default function CourtsGrid({
  courts,
  onEditCourt,
  onDeleteCourt,
}: CourtsGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "1.25rem",
      }}
    >
      {courts.map((court) => (
        <CourtCard
          key={court.id}
          court={court}
          onEdit={onEditCourt}
          onDelete={onDeleteCourt}
        />
      ))}
    </div>
  );
}
