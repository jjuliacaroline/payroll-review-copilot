import { AccessStateCard } from "@/components/auth/access-state-card";
import { AccessStatusPanel } from "@/components/auth/access-status-panel";

export default function LoggedOutPage() {
  return (
    <AccessStateCard
      eyebrow="Signed Out"
      title="You are now logged out"
      description="The session cookie was cleared. You can reopen the invite link whenever you are ready to review payroll."
      actionHref="/access"
      actionLabel="Return to access page"
    >
      <AccessStatusPanel
        items={[
          "Your browser no longer has an authenticated session.",
          "Use the invite link to sign back in.",
          "The demo session stays private to this browser.",
        ]}
      />
    </AccessStateCard>
  );
}
