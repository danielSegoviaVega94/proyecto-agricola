import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerClientMock, getAllMock, setMock } = vi.hoisted(() => ({
  createServerClientMock: vi.fn(),
  getAllMock: vi.fn(),
  setMock: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: getAllMock,
    set: setMock,
  }),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";

describe("createServerSupabaseClient", () => {
  beforeEach(() => {
    createServerClientMock.mockReset();
    getAllMock.mockReset();
    setMock.mockReset();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "";
  });

  it("returns a supabase client with auth API available", async () => {
    const getUser = vi.fn();
    createServerClientMock.mockReturnValue({
      auth: {
        getUser,
      },
    });

    const client = await createServerSupabaseClient();

    expect(client.auth).toBeDefined();
    expect(client.auth.getUser).toBeTypeOf("function");
    expect(createServerClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      }),
    );
  });

  it("uses publishable key when anon key is missing", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";
    createServerClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn(),
      },
    });

    await createServerSupabaseClient();

    expect(createServerClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "publishable-key",
      expect.any(Object),
    );
  });
});
