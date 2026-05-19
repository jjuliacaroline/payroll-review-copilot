import type { ChecklistItemKey } from "@/lib/domain/types";

export type ChecklistItemStatus = "complete" | "incomplete" | "blocked";

export type ChecklistItem = {
  key: ChecklistItemKey;
  label: string;
  status: ChecklistItemStatus;
  detail?: string;
};
