import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { OnboardingForm } from "@/app/onboarding/onboarding-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("OnboardingForm", () => {
  it("renders required profile fields for vendedor onboarding", () => {
    const html = renderToStaticMarkup(
      <OnboardingForm
        state={{ status: "idle", message: "", redirectTo: null }}
        action={async () => ({ status: "idle", message: "", redirectTo: null })}
      />,
    );

    expect(html).toContain("Completa tu perfil");
    expect(html).toContain("Nombre completo");
    expect(html).toContain("Comuna");
    expect(html).toContain("Guardar perfil");
  });
});
