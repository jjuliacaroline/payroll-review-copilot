import { AccessStateCard } from "@/components/auth/access-state-card";
import { AccessStatusPanel } from "@/components/auth/access-status-panel";

export default function InvalidAccessPage() {
  return (
    <AccessStateCard
      eyebrow="Access Error"
      title="This invite link is not valid"
      description="The link appears to be malformed or no longer usable. Request a fresh demo link from the sender."
      actionHref="/access"
      actionLabel="Back to access page"
    >
      <AccessStatusPanel
        items={[
          "The link may have been copied incorrectly.",
          "The invite may have already been replaced.",
          "A new private demo link should resolve this immediately.",
        ]}
      />
    </AccessStateCard>
  );
}
