import { beforeEach, describe, expect, it, vi } from "vitest";

import { completeOnboarding } from "@/app/onboarding/actions";
import { initialOnboardingState } from "@/app/onboarding/state";

const { revalidatePathMock, getUserMock, upsertMock, createServerSupabaseClientMock } = vi.hoisted(
  () => ({
    revalidatePathMock: vi.fn(),
    getUserMock: vi.fn(),
    upsertMock: vi.fn(),
    createServerSupabaseClientMock: vi.fn(),
  }),
);

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

describe("completeOnboarding", () => {
  beforeEach(() => {
    revalidatePathMock.mockReset();
    getUserMock.mockReset();
    upsertMock.mockReset();
    createServerSupabaseClientMock.mockReset();

    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        getUser: getUserMock,
      },
      from: vi.fn().mockReturnValue({
        upsert: upsertMock,
      }),
    });
  });

  it("rejects when there is no authenticated user", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    const formData = new FormData();
    formData.set("full_name", "Don Luis");
    formData.set("comuna", "Vicuña");

    const result = await completeOnboarding(initialOnboardingState, formData);

    expect(result.status).toBe("error");
    expect(result.message).toContain("sesión");
  });

  it("creates or updates user profile for authenticated user", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "11111111-1111-1111-1111-111111111111" } },
      error: null,
    });
    upsertMock.mockResolvedValue({ error: null });

    const formData = new FormData();
    formData.set("full_name", "Don Luis");
    formData.set("business_name", "Huerto Don Luis");
    formData.set("phone", "+56912345678");
    formData.set("comuna", "Vicuña");
    formData.set("avatar_url", "https://example.com/avatar.jpg");

    const result = await completeOnboarding(initialOnboardingState, formData);

    expect(result.status).toBe("success");
    expect(result.redirectTo).toBe("/perfil/11111111-1111-1111-1111-111111111111");
    expect(upsertMock).toHaveBeenCalledWith({
      id: "11111111-1111-1111-1111-111111111111",
      full_name: "Don Luis",
      business_name: "Huerto Don Luis",
      phone: "+56912345678",
      comuna: "Vicuña",
      avatar_url: "https://example.com/avatar.jpg",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/perfil/11111111-1111-1111-1111-111111111111");
  });
});
