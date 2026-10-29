import { profile } from "@/data/profile";
import { RetroBrochureContact } from "@/features/portfolio-3d/components/RetroBrochureProfile";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("RetroBrochureContact", () => {
  it("keeps current portfolio contact data inside the 3D brochure", () => {
    render(<RetroBrochureContact interactive={false} />);

    expect(screen.getByRole("heading", { name: profile.name })).toBeVisible();
    expect(screen.getByRole("link", { name: `Email ${profile.name}` })).toHaveAttribute(
      "href",
      profile.contact.email.href
    );
    expect(screen.getByRole("link", { name: `Call ${profile.name}` })).toHaveAttribute(
      "href",
      profile.contact.phone.href
    );
    expect(screen.getByRole("link", { name: "Open LinkedIn profile" })).toHaveAttribute(
      "href",
      profile.contact.linkedIn.href
    );
    expect(screen.getByRole("link", { name: "Open GitHub profile" })).toHaveAttribute(
      "href",
      profile.contact.github.href
    );
  });

  it("removes inactive brochure links from keyboard navigation", () => {
    render(<RetroBrochureContact interactive={false} />);

    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("tabindex", "-1");
    }
  });
});
