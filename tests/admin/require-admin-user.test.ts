import { beforeEach, describe, expect, it, vi } from "vitest";

import { requireAdminUser } from "@/lib/admin/require-admin-user";

const { createServerSupabaseClientMock, getUserMock, maybeSingleProfileMock, redirectMock } =
  vi.hoisted(() => ({
    createServerSupabaseClientMock: vi.fn(),
    getUserMock: vi.fn(),
    maybeSingleProfileMock: vi.fn(),
    redirectMock: vi.fn((path: string) => {
      throw new Error(`REDIRECT:${path}`);
    }),
  }));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

describe("requireAdminUser", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
    getUserMock.mockReset();
    maybeSingleProfileMock.mockReset();
    redirectMock.mockReset();
    redirectMock.mockImplementation((path: string) => {
      throw new Error(`REDIRECT:${path}`);
    });
  });

  it("redirects non-admin users away from admin pages", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "buyer-1" } },
      error: null,
    });
    maybeSingleProfileMock.mockResolvedValue({
      data: { id: "buyer-1", role: "buyer" },
      error: null,
    });

    createServerSupabaseClientMock.mockResolvedValue({
      auth: { getUser: getUserMock },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: maybeSingleProfileMock,
          })),
        })),
      })),
    });

    await expect(requireAdminUser()).rejects.toThrow("REDIRECT:/");
  });
});
