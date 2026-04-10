import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";

import PrivacyPage from "./page";

describe("PrivacyPage", () => {
  it('renders "dati restano sul tuo dispositivo"', () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/dati restano sul tuo dispositivo/i)).toBeDefined();
  });

  it('renders "Titolare del trattamento"', () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/titolare del trattamento/i)).toBeDefined();
  });
});
