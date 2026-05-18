import { AccessStateCard } from "@/components/auth/access-state-card";
import { AccessStatusPanel } from "@/components/auth/access-status-panel";

export default function SessionExpiredPage() {
  return (
    <AccessStateCard
      eyebrow="Session Ended"
      title="Your demo session has expired"
      description="For security, the signed session is limited in time. Open a fresh invite link to continue."
      actionHref="/access"
      actionLabel="Return to access"
    >
      <AccessStatusPanel
        items={[
          "Your invite session is no longer active.",
          "No payroll data was lost.",
          "A valid invite link will create a new session.",
        ]}
      />
    </AccessStateCard>
  );
}
