import { getToken } from "@/lib/auth";

export type ChatMessageDto = {
  id: string;
  userId?: string;
  user: string;
  avatar: string;
  time: string;
  text: string;
  deleted?: boolean;
  mine?: boolean;
  forwarded?: boolean;
  forwardedFrom?: { user: string; text: string } | null;
  reactions: Array<{ emoji: string; count: number; mine?: boolean }>;
};

function apiBase() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
}

export class ApiError extends Error {
  status: number;
  payload?: Record<string, unknown>;

  constructor(message: string, status: number, payload?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (options.auth !== false) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${apiBase()}${path}`, {
    ...options,
    headers,
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new ApiError(
      (data.error as string) || "Request failed",
      res.status,
      data
    );
  }
  return data as T;
}

export const api = {
  me: () =>
    request<{
      user: import("@/lib/auth").AuthUser & {
        bio?: string | null;
        onboardingCompletedAt?: string | null;
        cocAcceptedAt?: string | null;
      };
      programme: {
        name: string;
        theme: string;
        venue: string;
        startDate: string;
        endDate: string;
        welcomeLine: string;
        challengeTrack: string;
        daysRemaining: number;
      };
      team: {
        id: string;
        name: string;
        progress: number;
        members: Array<{
          id: string;
          name: string;
          title?: string | null;
          avatar?: string | null;
          online?: boolean;
          role?: string;
          tasks?: number;
        }>;
        mentors: Array<{
          id: string;
          name: string;
          title?: string | null;
          avatar?: string | null;
        }>;
        challenge?: { title: string } | null;
      } | null;
      mentorTeams: Array<{
        id: string;
        name: string;
        progress: number;
        members: string[];
        submissions: number;
      }>;
      unreadNotifications: number;
    }>("/api/auth/me"),

  dashboard: () => request<Record<string, unknown>>("/api/dashboard"),

  onboarding: (body: Record<string, unknown>) =>
    request("/api/onboarding", { method: "POST", body: JSON.stringify(body) }),

  updateProfile: (body: Record<string, unknown>) =>
    request("/api/profile", { method: "PUT", body: JSON.stringify(body) }),

  leaderboard: () =>
    request<{
      updatedAt?: string;
      source?: string;
      leaderboard: Array<{
        rank: number;
        teamId: string;
        team: string;
        score: number;
        progress: number;
        project?: string | null;
        challenge?: string | null;
        members: string[];
        mentors: string[];
      }>;
    }>("/api/leaderboard"),

  setLeaderboardScore: (body: {
    teamId: string;
    score: number;
    notes?: string;
  }) =>
    request<{
      ok: boolean;
      leaderboard: Array<{
        rank: number;
        teamId: string;
        team: string;
        score: number;
        progress: number;
        project?: string | null;
        challenge?: string | null;
        members: string[];
        mentors: string[];
      }>;
    }>("/api/leaderboard", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  announcements: () =>
    request<{
      updatedAt?: string;
      source?: string;
      announcements: Array<{
        id: string;
        title: string;
        body: string;
        type: string;
        pinned: boolean;
        author: string;
        date: string;
        time: string;
        unread: boolean;
      }>;
    }>("/api/announcements"),

  createAnnouncement: (body: {
    title: string;
    body: string;
    type?: string;
    pinned?: boolean;
  }) =>
    request("/api/announcements", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  notifications: () =>
    request<{
      notifications: Array<{
        id: string;
        title: string;
        text: string;
        category: string;
        href: string;
        unread: boolean;
        time: string;
      }>;
    }>("/api/notifications"),

  readNotifications: (body: { id?: string } = {}) =>
    request("/api/notifications/read", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  clearNotifications: (body: { id?: string } = {}) =>
    request<{ ok: boolean; cleared: number }>("/api/notifications/clear", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  teams: () =>
    request<{
      teams: Array<{
        id: string;
        name: string;
        slug: string;
        locked: boolean;
        progress: number;
        members: Array<{
          id: string;
          name: string;
          email?: string;
          title?: string | null;
          role?: string;
        }>;
        mentors: string[];
      }>;
    }>("/api/teams"),

  myTeam: () =>
    request<{
      team: {
        id: string;
        name: string;
        description?: string | null;
        progress: number;
        members: Array<{
          id: string;
          name: string;
          role: string;
          avatar?: string | null;
          online: boolean;
          tasks: number;
          email: string;
        }>;
        mentors: Array<{
          id: string;
          name: string;
          title: string;
          avatar?: string | null;
          online: boolean;
        }>;
      };
    }>("/api/teams/mine"),

  createTeam: (body: { name: string; description?: string }) =>
    request("/api/teams", { method: "POST", body: JSON.stringify(body) }),

  setTeamsLocked: (locked: boolean) =>
    request<{ locked: boolean; updated: number; message: string }>(
      "/api/admin/teams/lock",
      { method: "POST", body: JSON.stringify({ locked }) }
    ),

  deleteTeam: (id: string) =>
    request<{ ok: boolean; id: string }>(`/api/teams/${id}`, {
      method: "DELETE",
    }),

  setTeamMembers: (teamId: string, memberIds: string[]) =>
    request<{
      team: {
        id: string;
        name: string;
        members: Array<{
          id: string;
          name: string;
          email?: string;
          title?: string | null;
          role?: string;
        }>;
        mentors: string[];
      };
    }>(`/api/teams/${teamId}/members`, {
      method: "PUT",
      body: JSON.stringify({ memberIds }),
    }),

  tasks: () =>
    request<{
      isLead: boolean;
      me: { id: string; name: string };
      members: Array<{ id: string; name: string }>;
      columns: Record<
        string,
        Array<{
          id: string;
          title: string;
          assigneeId: string | null;
          assignee: string;
          assignees: string[];
          due: string;
          priority: "High" | "Medium" | "Low";
          comments: number;
          attachments: number;
          attachmentUrls?: string[];
          labels: string[];
          canMove: boolean;
        }>
      >;
    }>("/api/tasks"),

  uploadFile: (body: {
    filename: string;
    contentType: string;
    dataBase64: string;
  }) =>
    request<{ url: string; filename: string; size: number }>("/api/upload", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  attachTaskFile: (taskId: string, url: string) =>
    request<{
      task: { id: string; attachments: number; attachmentUrls: string[] };
    }>(`/api/tasks/${taskId}/attachments`, {
      method: "POST",
      body: JSON.stringify({ url }),
    }),

  moveTask: (body: { id: string; column: string; sortOrder?: number; assigneeId?: string | null }) =>
    request("/api/tasks/move", { method: "POST", body: JSON.stringify(body) }),

  createTask: (body: {
    title: string;
    column?: string;
    priority?: string;
    dueDate?: string;
    assigneeId?: string | null;
  }) =>
    request<{
      task: {
        id: string;
        title: string;
        assigneeId: string | null;
        assignee: string;
        assignees: string[];
        due: string;
        priority: string;
        comments: number;
        attachments: number;
        labels: string[];
        canMove: boolean;
        column: string;
      };
    }>("/api/tasks", { method: "POST", body: JSON.stringify(body) }),

  taskComments: (taskId: string) =>
    request<{
      comments: Array<{
        id: string;
        body: string;
        author: string;
        authorId: string;
        createdAt: string;
      }>;
    }>(`/api/tasks/${taskId}/comments`),

  postTaskComment: (taskId: string, body: string) =>
    request<{
      comment: {
        id: string;
        body: string;
        author: string;
        authorId: string;
        createdAt: string;
      };
    }>(`/api/tasks/${taskId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    }),

  responsibilities: () =>
    request<{
      isLead: boolean;
      members: Array<{ id: string; name: string; teamRole: string }>;
      responsibilities: Array<{
        id: string;
        label: string;
        userId: string | null;
        name: string;
        avatar?: string | null;
      }>;
    }>("/api/responsibilities"),

  saveResponsibilities: (
    responsibilities: Array<{ label: string; userId?: string | null }>
  ) =>
    request<{
      isLead: boolean;
      members: Array<{ id: string; name: string; teamRole: string }>;
      responsibilities: Array<{
        id: string;
        label: string;
        userId: string | null;
        name: string;
        avatar?: string | null;
      }>;
    }>("/api/responsibilities", {
      method: "PUT",
      body: JSON.stringify({ responsibilities }),
    }),

  workspace: () =>
    request<{
      sections: Array<{
        id: string;
        title: string;
        content: string;
        updatedAt: string;
      }>;
    }>("/api/workspace"),

  createWorkspaceSection: (body: { title: string }) =>
    request<{
      section: {
        id: string;
        title: string;
        content: string;
        updatedAt: string;
      };
    }>("/api/workspace", { method: "POST", body: JSON.stringify(body) }),

  saveWorkspace: (body: {
    sectionId: string;
    content: string;
    title?: string;
  }) =>
    request("/api/workspace", { method: "PUT", body: JSON.stringify(body) }),

  teamChat: () =>
    request<{
      messages: ChatMessageDto[];
    }>("/api/chat/team"),

  postTeamChat: (text: string) =>
    request<{ message: ChatMessageDto }>("/api/chat/team", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  mentorChat: (teamId?: string) =>
    request<{
      teamId?: string;
      teamName?: string;
      mentors?: Array<{
        id: string;
        name: string;
        title?: string | null;
        avatar?: string | null;
        online?: boolean;
      }>;
      members?: Array<{
        id: string;
        name: string;
        title?: string | null;
        avatar?: string | null;
      }>;
      messages: ChatMessageDto[];
    }>(`/api/chat/mentor${teamId ? `?teamId=${encodeURIComponent(teamId)}` : ""}`),

  postMentorChat: (text: string, teamId?: string) =>
    request<{ message: ChatMessageDto }>("/api/chat/mentor", {
      method: "POST",
      body: JSON.stringify({ text, teamId }),
    }),

  reactChat: (messageId: string, emoji: string) =>
    request<{ message: ChatMessageDto }>("/api/chat/react", {
      method: "POST",
      body: JSON.stringify({ messageId, emoji }),
    }),

  deleteChatMessage: (messageId: string) =>
    request<{ message: ChatMessageDto }>("/api/chat/delete", {
      method: "POST",
      body: JSON.stringify({ messageId }),
    }),

  forwardChat: (messageId: string, channel: "team" | "mentor") =>
    request<{ message: ChatMessageDto; channel: "team" | "mentor" }>(
      "/api/chat/forward",
      {
        method: "POST",
        body: JSON.stringify({ messageId, channel }),
      }
    ),

  submission: () =>
    request<{ submission: Record<string, unknown> | null }>("/api/submission"),

  saveSubmission: (body: Record<string, unknown>) =>
    request("/api/submission", { method: "PUT", body: JSON.stringify(body) }),

  adminParticipants: () =>
    request<{
      participants: Array<{
        id: string;
        name: string;
        email: string;
        title?: string | null;
        team: string;
        online: boolean;
      }>;
    }>("/api/admin/participants"),

  deleteMentor: (id: string) =>
    request<{ ok: boolean; id: string }>(`/api/admin/mentors/${id}`, {
      method: "DELETE",
    }),

  adminSubmissions: () =>
    request<{
      canScore?: boolean;
      canReview?: boolean;
      submissions: Array<{
        id: string;
        teamId?: string;
        team: string;
        project: string;
        description?: string | null;
        status: string;
        timestamp: string;
        repo?: string | null;
        demo?: string | null;
        pitch?: string | null;
        slides?: string | null;
        video?: string | boolean | null;
        docs?: string | boolean | null;
        prototype?: string | null;
        zip?: string | null;
        version: string;
        score?: number | null;
        scoreNotes?: string | null;
        breakdown?: {
          solutionDevelopment: number;
          challengeRequirements: number;
          presentation: number;
          communication: number;
        } | null;
        files?: Array<{ key: string; label: string; url: string }>;
      }>;
    }>("/api/admin/submissions"),

  updateSubmission: (body: Record<string, unknown>) =>
    request("/api/admin/submissions", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  mentors: () =>
    request<{
      mentors: Array<{
        id: string;
        name: string;
        title?: string | null;
        teams: string[];
        teamIds: string[];
      }>;
    }>("/api/mentors"),

  publicMentors: () =>
    request<{
      mentors: Array<{
        id: string;
        name: string;
        title: string;
        bio: string | null;
        avatar: string | null;
      }>;
    }>("/api/public/mentors", { auth: false }),

  assignMentors: (body: { mentorId: string; teamIds: string[] }) =>
    request("/api/mentors/assign", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
