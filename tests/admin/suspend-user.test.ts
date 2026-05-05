import { beforeEach, describe, expect, it, vi } from "vitest";

import { suspendUser } from "@/app/admin/actions";

const {
  createServerSupabaseClientMock,
  requireAdminUserMock,
  updateUsersMock,
  eqUserIdMock,
  updateReportsMock,
  eqReportIdMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  requireAdminUserMock: vi.fn(),
  updateUsersMock: vi.fn(),
  eqUserIdMock: vi.fn(),
  updateReportsMock: vi.fn(),
  eqReportIdMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

vi.mock("@/lib/admin/require-admin-user", () => ({
  requireAdminUser: requireAdminUserMock,
}));

describe("suspendUser", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
    requireAdminUserMock.mockReset();
    updateUsersMock.mockReset();
    eqUserIdMock.mockReset();
    updateReportsMock.mockReset();
    eqReportIdMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("suspends the user and resolves the source report", async () => {
    requireAdminUserMock.mockResolvedValue({
      id: "admin-1",
      role: "admin",
      fullName: "Admin",
    });

    eqUserIdMock.mockResolvedValue({ error: null });
    updateUsersMock.mockReturnValue({ eq: eqUserIdMock });
    eqReportIdMock.mockResolvedValue({ error: null });
    updateReportsMock.mockReturnValue({ eq: eqReportIdMock });

    createServerSupabaseClientMock.mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === "users") {
          return { update: updateUsersMock };
        }

        if (table === "reports") {
          return { update: updateReportsMock };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const result = await suspendUser({
      userId: "seller-1",
      reportId: "report-1",
    });

    expect(result.status).toBe("success");
    expect(updateUsersMock).toHaveBeenCalledWith({ is_suspended: true });
    expect(updateReportsMock).toHaveBeenCalledWith({
      status: "resolved",
      resolved_by: "admin-1",
    });
  });
});
