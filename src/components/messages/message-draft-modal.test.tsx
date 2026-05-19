import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import MessageDraftModal from "./message-draft-modal";

describe("MessageDraftModal", () => {
  it("renders the draft content and actions", () => {
    const html = renderToStaticMarkup(
      <MessageDraftModal
        open={true}
        draft={{
          id: "message_123",
          anomalyId: "anom_missing_working_hours",
          employeeId: "emp_02",
          tone: "neutral",
          subject: "Täydennyspyyntö: puuttuvat työtunnit",
          body: "Hei Mikko Lahtinen,\n\nTarvitsemme vielä puuttuvat tunnit.",
          language: "fi",
          generatedAt: "2026-05-18T08:15:00.000Z",
        }}
        generatedAtLabel="18.5.2026 klo 8.15"
        copyConfirmation={null}
        isCopying={false}
        isSending={false}
        improveToneLabel="Improve tone"
        canCopy={true}
        canSend={true}
        onClose={() => undefined}
        onCopy={() => undefined}
        onImproveTone={() => undefined}
        onMarkAsSent={() => undefined}
      />,
    );

    expect(html).toContain("Review before sending");
    expect(html).toContain("Täydennyspyyntö: puuttuvat työtunnit");
    expect(html).toContain("Tarvitsemme vielä puuttuvat tunnit.");
    expect(html).toContain("Copy message");
    expect(html).toContain("Mark as sent");
  });
});
