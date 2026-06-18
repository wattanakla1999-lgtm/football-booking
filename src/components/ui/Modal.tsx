import type { ReactNode } from "react";

import { cn } from "@/src/utils/classNames";

type ModalProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function Modal({
  children,
  className,
  contentClassName,
}: ModalProps) {
  return (
    <div
      className={cn(
        "admin-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4",
        className,
      )}
    >
      <div
        className={cn(
          "admin-modal-content w-full",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
