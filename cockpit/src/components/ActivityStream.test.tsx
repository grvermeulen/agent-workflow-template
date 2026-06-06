import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivityStream } from "@/components/ActivityStream";
import type { ActivityItem } from "@/lib/schemas/activity";

describe("ActivityStream", () => {
  it("renders an empty state when there are no items", () => {
    render(<ActivityStream items={[]} />);
    expect(screen.getByText("Nog geen activiteit.")).toBeInTheDocument();
  });

  it("renders items with actor and formatted time", () => {
    const items: ActivityItem[] = [
      {
        id: "1",
        timestamp: "2026-01-02T09:30:00",
        actor: "GitHub",
        message: "Commits gepusht naar acme/widgets",
        kind: "info",
      },
    ];
    render(<ActivityStream items={items} />);
    expect(screen.getByText("Commits gepusht naar acme/widgets")).toBeInTheDocument();
    expect(screen.getByText(/GitHub/)).toBeInTheDocument();
  });
});
