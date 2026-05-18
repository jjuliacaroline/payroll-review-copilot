import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ReviewGovernanceBanner from "../review-governance-banner";

describe("ReviewGovernanceBanner", () => {
  it("lists the governance commitments", () => {
    const html = renderToStaticMarkup(<ReviewGovernanceBanner />);

    expect(html).toContain("AI suggests");
    expect(html).toContain("Human reviews");
    expect(html).toContain("Human approves");
    expect(html).toContain("All decisions are logged");
  });
});
