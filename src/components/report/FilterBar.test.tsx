// @ts-nocheck
import "@testing-library/jest-dom";
import { describe, expect, it, beforeEach } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

const mockRouterPush = jest.fn();
const mockSearchParams = new URLSearchParams("range=7");

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
  useSearchParams: () => mockSearchParams,
}));

import FilterBar from "@/components/report/FilterBar";

describe("FilterBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouterPush.mockClear();
    mockSearchParams.delete("range");
    mockSearchParams.set("range", "7");
  });

  it("renders all four range options", () => {
    render(<FilterBar />);
    expect(screen.getByText("7 giorni")).toBeInTheDocument();
    expect(screen.getByText("30 giorni")).toBeInTheDocument();
    expect(screen.getByText("90 giorni")).toBeInTheDocument();
    expect(screen.getByText("Tutto")).toBeInTheDocument();
  });

  it('sets "7 giorni" as active by default', () => {
    render(<FilterBar />);
    const btn = screen.getByRole("button", { name: /7 giorni/i });
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it('renders with "30 giorni" active when range=30', () => {
    mockSearchParams.set("range", "30");
    render(<FilterBar />);
    const btn = screen.getByRole("button", { name: /30 giorni/i });
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it('renders with "Tutto" active when range=all', () => {
    mockSearchParams.set("range", "all");
    render(<FilterBar />);
    const btn = screen.getByRole("button", { name: /Tutto/i });
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it("calls router.push with new range when button is clicked", () => {
    render(<FilterBar />);
    fireEvent.click(screen.getByRole("button", { name: /30 giorni/i }));
    expect(mockRouterPush).toHaveBeenCalledWith("?range=30", { scroll: false });
  });

  it("updates active button when range changes", () => {
    const { rerender } = render(<FilterBar />);
    expect(screen.getByRole("button", { name: /7 giorni/i })).toHaveAttribute("aria-pressed", "true");

    mockSearchParams.set("range", "90");
    rerender(<FilterBar />);
    expect(screen.getByRole("button", { name: /90 giorni/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /7 giorni/i })).toHaveAttribute("aria-pressed", "false");
  });
});
