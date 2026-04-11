import "@testing-library/jest-dom";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/services/db", () => ({
  clearAllLocalData: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => "/settings",
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("@/hooks/useSettings", () => ({
  useSettings: (selector: (state: Record<string, unknown>) => unknown) => {
    const state = {
      language: "it",
      notificationsEnabled: false,
      sticazziEnabled: true,
      ecoEnabled: true,
      toggleNotifications: jest.fn(),
      toggleSticazzi: jest.fn(),
      toggleEco: jest.fn(),
    };
    return selector(state);
  },
}));

import SettingsPage from "./page";

describe("SettingsPage", () => {
  it("links to privacy page", () => {
    render(<SettingsPage />);
    const link = screen.getByRole("link", { name: /privacy/i });
    expect(link.getAttribute("href")).toBe("/privacy");
  });

  it("asks confirmation before deleting", async () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();

    render(<SettingsPage />);

    const button = screen.getByRole("button", { name: /cancella tutti i dati/i });
    await user.click(button);

    expect(confirmSpy).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("renders Lingua section with Italiano as active", () => {
    render(<SettingsPage />);
    expect(screen.getByText("Italiano")).toBeInTheDocument();
    expect(screen.getByText("Attiva")).toBeInTheDocument();
  });

  it("renders unavailable languages with Prossimamente badge", () => {
    render(<SettingsPage />);
    const badges = screen.getAllByText("Prossimamente");
    expect(badges).toHaveLength(2);
  });

  it("renders Notifiche toggle", () => {
    render(<SettingsPage />);
    const toggle = screen.getByRole("switch", { name: "Notifiche giornaliere" });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("renders Eco del Giorno toggle", () => {
    render(<SettingsPage />);
    const toggle = screen.getByRole("switch", { name: "Eco del Giorno" });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("renders Sticazzi toggle", () => {
    render(<SettingsPage />);
    const toggle = screen.getByRole("switch", { name: "Sticazzi" });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("renders all section headers", () => {
    render(<SettingsPage />);
    expect(screen.getByText(/🌐 Lingua/)).toBeInTheDocument();
    expect(screen.getByText(/🔔 Notifiche/)).toBeInTheDocument();
    expect(screen.getByText(/✨ Contenuto/)).toBeInTheDocument();
    expect(screen.getByText(/🗑️ Gestione dati/)).toBeInTheDocument();
  });
});
