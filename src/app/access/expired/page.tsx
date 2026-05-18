import { AccessStateCard } from "@/components/auth/access-state-card";
import { AccessStatusPanel } from "@/components/auth/access-status-panel";

export default function ExpiredAccessPage() {
  return (
    <AccessStateCard
      eyebrow="Access Expired"
      title="This demo link has expired"
      description="Invite links are short-lived for security. Ask the sender for a fresh demo link."
      actionHref="/access"
      actionLabel="Back to access page"
    >
      <AccessStatusPanel
        items={[
          "The invite window has passed.",
          "No session was created from this link.",
          "A new invite will restore access.",
        ]}
      />
    </AccessStateCard>
  );
}
