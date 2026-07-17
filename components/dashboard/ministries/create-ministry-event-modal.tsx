"use client";

import { CreateActivityModal } from "@/components/dashboard/activities/create-activity-modal";

interface CreateMinistryEventModalProps {
  ministryId: string;
  ministryName: string;
  open: boolean;
  onClose: () => void;
  defaultStartsAtValue?: string;
}

/**
 * Wrapper que reutiliza o formulário padrão de criação (inclui inscrição).
 * Mantém a API usada nas telas de ministério.
 */
export function CreateMinistryEventModal({
  ministryId,
  ministryName,
  open,
  onClose,
  defaultStartsAtValue,
}: CreateMinistryEventModalProps) {
  return (
    <CreateActivityModal
      open={open}
      onClose={onClose}
      fixedMinistryId={ministryId}
      fixedMinistryName={ministryName}
      defaultStartsAtValue={defaultStartsAtValue}
    />
  );
}
