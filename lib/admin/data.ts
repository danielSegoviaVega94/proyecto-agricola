import { createServerSupabaseClient } from "@/lib/supabase/server";

type ReportRow = {
  id: string;
  reason: string;
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  created_at: string;
  conversation_id: string | null;
  reporter: { full_name: string | null; business_name: string | null }[] | null;
  reported: { id: string; full_name: string | null; business_name: string | null }[] | null;
  conversation:
    | {
        id: string;
        product_id: string;
      }[]
    | null;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export type AdminReportItem = {
  id: string;
  reason: string;
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  createdAt: string;
  conversationId: string | null;
  reportedUserId: string | null;
  reporterName: string;
  reportedName: string;
  messages: Array<{
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  }>;
};

export type AdminUserItem = {
  id: string;
  fullName: string;
  businessName: string | null;
  role: "seller" | "buyer" | "admin";
  comuna: string | null;
  isSuspended: boolean;
};

function pickName(
  profile:
    | {
        id?: string;
        full_name: string | null;
        business_name: string | null;
      }
    | undefined,
) {
  if (!profile) {
    return "Usuario";
  }

  return profile.business_name ?? profile.full_name ?? "Usuario";
}

export async function getAdminReports() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("reports")
    .select(
      `
        id,
        reason,
        status,
        created_at,
        conversation_id,
        reporter:users!reports_reporter_id_fkey(full_name, business_name),
        reported:users!reports_reported_id_fkey(id, full_name, business_name),
        conversation:conversations(id, product_id)
      `,
    )
    .in("status", ["pending", "reviewing"])
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [] as AdminReportItem[];
  }

  const conversationIds = data
    .map((report) => report.conversation_id)
    .filter((value): value is string => Boolean(value));

  const { data: messagesData } = conversationIds.length
    ? await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, content, created_at")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: true })
    : { data: [] as MessageRow[] };

  const messagesByConversation = new Map<string, MessageRow[]>();
  for (const message of (messagesData as MessageRow[] | null) ?? []) {
    const current = messagesByConversation.get(message.conversation_id) ?? [];
    current.push(message);
    messagesByConversation.set(message.conversation_id, current);
  }

  return (data as unknown as ReportRow[]).map((report) => {
    const reporter = report.reporter?.[0];
    const reported = report.reported?.[0];
    const messages = report.conversation_id
      ? (messagesByConversation.get(report.conversation_id) ?? []).slice(-5)
      : [];

    return {
      id: report.id,
      reason: report.reason,
      status: report.status,
      createdAt: report.created_at,
      conversationId: report.conversation_id,
      reportedUserId: reported?.id ?? null,
      reporterName: pickName(reporter),
      reportedName: pickName(reported),
      messages: messages.map((message) => ({
        id: message.id,
        senderId: message.sender_id,
        content: message.content,
        createdAt: message.created_at,
      })),
    };
  });
}

export async function getAdminUsers(searchQuery?: string) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("users")
    .select("id, full_name, business_name, role, comuna, is_suspended")
    .order("updated_at", { ascending: false });

  const q = searchQuery?.trim();
  if (q) {
    query = query.or(`full_name.ilike.%${q}%,business_name.ilike.%${q}%,comuna.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error || !data) {
    return [] as AdminUserItem[];
  }

  return data.map((user) => ({
    id: user.id,
    fullName: user.full_name ?? "Usuario",
    businessName: user.business_name ?? null,
    role: user.role,
    comuna: user.comuna ?? null,
    isSuspended: user.is_suspended,
  }));
}
