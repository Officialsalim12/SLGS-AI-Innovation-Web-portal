const { prisma } = require("./db");
const {
  UPLOAD_DIR,
  ensureUploadDir,
  safeFilename,
  publicUploadUrl,
  crypto,
  fs,
  path,
} = require("./upload");
const { issueInvite, publicInvite, frontendBaseUrl } = require("./invite");
const { sendAnnouncementEmail } = require("./mail/brevo");

const EVENT = {
  name: "KNS and SLGS AI Innovation Bootcamp & Challenge 2026",
  theme: "Building for Sierra Leone",
  venue: "Sierra Leone Grammar School, Murray Town",
  startDate: "2026-07-27",
  endDate: "2026-08-20",
  welcomeLine:
    "Four weeks: two weeks of instructor led bootcamp, then two weeks building with your team and mentor. Facilitated by KNS in partnership with SLGS.",
  challengeTrack: "AI Innovation Bootcamp & Challenge",
};

function daysRemaining(endDate = EVENT.endDate) {
  const [year, month, day] = String(endDate).split("-").map(Number);
  const end = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((end.getTime() - today.getTime()) / 86400000));
}

function send(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function requireUser(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  const jwt = require("jsonwebtoken");
  const JWT_SECRET = process.env.JWT_SECRET || "ghs-dev-secret-change-me";
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.emailVerifiedAt) return null;
    return user;
  } catch {
    return null;
  }
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    title: user.title,
    bio: user.bio,
    onboardingCompletedAt: user.onboardingCompletedAt,
    cocAcceptedAt: user.cocAcceptedAt,
    emailVerifiedAt: user.emailVerifiedAt,
    notificationPrefs:
      user.notificationPrefs && typeof user.notificationPrefs === "object"
        ? user.notificationPrefs
        : null,
    createdAt: user.createdAt,
  };
}

// Keep in sync with frontend notification prefs
const NOTIFICATION_PREF_CATEGORIES = {
  "New announcements": ["announcement"],
  "Mentor comments": ["mentor"],
  "New chat messages": ["chat"],
  "Task assignments": ["task"],
  "Kanban updates": ["task"],
  "Submission deadlines": ["deadline"],
  "Leaderboard updates": ["leaderboard"],
  "Unread team messages": ["chat", "mentor"],
  "Pending submission reviews": ["mentor", "announcement"],
  "Team milestone updates": ["task", "announcement"],
  "Admin announcements": ["announcement"],
  "Meeting reminders": ["deadline", "mentor"],
  "New registrations": ["announcement"],
  "Pending submissions": ["announcement"],
  "Team lock status changes": ["announcement"],
  "Leaderboard publish confirmations": ["leaderboard"],
  "System alerts": ["announcement"],
};

function allowedCategoriesFromPrefs(prefs) {
  if (!prefs || typeof prefs !== "object") return null;
  const enabled = Object.entries(prefs)
    .filter(([, on]) => on)
    .flatMap(([label]) => NOTIFICATION_PREF_CATEGORIES[label] || []);
  return new Set(enabled);
}

const DEFAULT_RESPONSIBILITIES = [
  "Project Lead",
  "Frontend",
  "Backend",
  "UI/UX",
  "Presentation",
  "Research",
];

const DEFAULT_WORKSPACE_SECTIONS = [
  { sectionId: "problem", title: "Problem Statement" },
  { sectionId: "solution", title: "Solution Overview" },
  { sectionId: "research", title: "Research Notes" },
  { sectionId: "tech", title: "Tech Stack" },
  { sectionId: "demo", title: "Demo Script" },
  { sectionId: "meetings", title: "Meeting Notes" },
];

async function ensureDefaultWorkspaceDocs(teamId) {
  const existing = await prisma.workspaceDoc.count({ where: { teamId } });
  if (existing > 0) return;

  await prisma.workspaceDoc.createMany({
    data: DEFAULT_WORKSPACE_SECTIONS.map((s) => ({
      teamId,
      sectionId: s.sectionId,
      title: s.title,
      content: "",
    })),
  });
}
async function getMembership(userId) {
  return prisma.teamMember.findFirst({
    where: { userId },
    include: {
      team: {
        include: {
          members: { include: { user: true } },
          mentors: { include: { mentor: true } },
          mentor: true,
          challenge: true,
          _count: { select: { tasks: true, submissions: true } },
        },
      },
    },
  });
}

// Mentor's teams (join table + primary mentor)
async function getMentorAssignments(mentorId) {
  const [joined, primary] = await Promise.all([
    prisma.teamMentor.findMany({
      where: { mentorId },
      select: { teamId: true },
    }),
    prisma.team.findMany({
      where: { mentorId },
      select: { id: true },
    }),
  ]);
  return [
    ...new Set([...joined.map((j) => j.teamId), ...primary.map((t) => t.id)]),
  ];
}

async function mentorCanAccessTeam(mentorId, teamId) {
  const linked = await prisma.teamMentor.findFirst({
    where: { mentorId, teamId },
    select: { id: true },
  });
  if (linked) return true;
  const primary = await prisma.team.findFirst({
    where: { id: teamId, mentorId },
    select: { id: true },
  });
  return Boolean(primary);
}

function mergeTeamMentors(team) {
  return [
    ...(team.mentor
      ? [
          {
            id: team.mentor.id,
            name: team.mentor.name,
            title: team.mentor.title || "Mentor",
            avatar: team.mentor.avatar,
            online: true,
          },
        ]
      : []),
    ...(team.mentors || []).map((tm) => ({
      id: tm.mentor.id,
      name: tm.mentor.name,
      title: tm.mentor.title || "Mentor",
      avatar: tm.mentor.avatar,
      online: false,
    })),
  ].filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i);
}

async function ensureDefaultResponsibilities(teamId, leadUserId = null) {
  const existing = await prisma.teamResponsibility.count({ where: { teamId } });
  if (existing > 0) return;

  await prisma.teamResponsibility.createMany({
    data: DEFAULT_RESPONSIBILITIES.map((label, sortOrder) => ({
      teamId,
      label,
      sortOrder,
      userId: label === "Project Lead" ? leadUserId : null,
    })),
  });
}

async function notify(userId, data) {
  return prisma.notification.create({
    data: {
      userId,
      title: data.title,
      body: data.body,
      category: data.category || "announcement",
      href: data.href || null,
    },
  });
}

async function handleMe(req, res) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });

  const membership = await getMembership(user.id);
  const unread = await prisma.notification.count({
    where: { userId: user.id, readAt: null },
  });

  let mentorTeams = [];
  if (user.role === "MENTOR") {
    const teamIds = await getMentorAssignments(user.id);
    const teams = teamIds.length
      ? await prisma.team.findMany({
          where: { id: { in: teamIds } },
          include: {
            members: { include: { user: true } },
            _count: {
              select: {
                submissions: { where: { status: { not: "DRAFT" } } },
              },
            },
          },
          orderBy: { name: "asc" },
        })
      : [];
    mentorTeams = teams.map((team) => ({
      id: team.id,
      name: team.name,
      progress: team.progress,
      members: team.members.map((m) => m.user.name),
      submissions: team._count.submissions,
    }));
  }

  send(res, 200, {
    user: publicUser(user),
    programme: { ...EVENT, daysRemaining: daysRemaining() },
    team: membership
      ? {
          id: membership.team.id,
          name: membership.team.name,
          slug: membership.team.slug,
          progress: membership.team.progress,
          description: membership.team.description,
          challenge: membership.team.challenge,
          memberRole: membership.role,
          memberTitle: membership.title,
          members: membership.team.members.map((m) => ({
            id: m.user.id,
            name: m.user.name,
            title: m.title || m.user.title,
            avatar: m.user.avatar,
            online: m.online,
            role: m.role,
            tasks: 0,
          })),
          mentors: mergeTeamMentors(membership.team),
        }
      : null,
    mentorTeams,
    unreadNotifications: unread,
  });
}

async function handleOnboarding(req, res, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });

  const name = String(body.name || user.name).trim();
  const title = String(body.title || "").trim() || null;
  const bio = String(body.bio || "").trim() || null;
  const teamId = body.teamId ? String(body.teamId) : null;
  const accepted = Boolean(body.accepted);
  const teamRoleRaw = String(body.teamRole || "MEMBER").toUpperCase();
  const teamRole = teamRoleRaw === "LEAD" ? "LEAD" : "MEMBER";

  if (!accepted) {
    return send(res, 400, { error: "Accept the Code of Conduct to continue." });
  }

  if (user.role === "PARTICIPANT" && !body.teamRole) {
    return send(res, 400, {
      error: "Select whether you are the Project Lead or a Member.",
    });
  }

  if (teamId && user.role === "PARTICIPANT") {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) return send(res, 404, { error: "Team not found." });
    if (team.locked) {
      return send(res, 403, { error: "This team is locked." });
    }

    if (teamRole === "LEAD") {
      const existingLead = await prisma.teamMember.findFirst({
        where: { teamId, role: "LEAD", NOT: { userId: user.id } },
      });
      if (existingLead) {
        return send(res, 409, {
          error:
            "This team already has a Project Lead. Join as a Member, or ask the lead to reassign.",
        });
      }
    }

    await prisma.teamMember.upsert({
      where: { teamId_userId: { teamId, userId: user.id } },
      update: { title, role: teamRole },
      create: { teamId, userId: user.id, title, role: teamRole },
    });

    if (teamRole === "LEAD") {
      await ensureDefaultResponsibilities(teamId, user.id);
      await ensureDefaultWorkspaceDocs(teamId);
      await prisma.teamResponsibility.updateMany({
        where: { teamId, label: "Project Lead" },
        data: { userId: user.id },
      });
    } else {
      await ensureDefaultResponsibilities(teamId);
      await ensureDefaultWorkspaceDocs(teamId);
    }
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      title,
      bio,
      onboardingCompletedAt: new Date(),
      cocAcceptedAt: new Date(),
    },
  });

  return send(res, 200, { user: publicUser(updated) });
}

async function handleProfile(req, res, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });

  const data = {
    name: String(body.name || user.name).trim(),
    title:
      body.title !== undefined
        ? String(body.title || "").trim() || null
        : user.title,
    bio:
      body.bio !== undefined
        ? String(body.bio || "").trim() || null
        : user.bio,
  };

  if (body.notificationPrefs !== undefined) {
    if (
      body.notificationPrefs === null ||
      (typeof body.notificationPrefs === "object" &&
        !Array.isArray(body.notificationPrefs))
    ) {
      data.notificationPrefs = body.notificationPrefs;
    } else {
      return send(res, 400, { error: "Invalid notification preferences." });
    }
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
  });

  return send(res, 200, { user: publicUser(updated) });
}

async function handleDashboard(req, res) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });

  const membership = await getMembership(user.id);
  const announcements = await prisma.announcement.count();
  const unread = await prisma.notification.count({
    where: { userId: user.id, readAt: null },
  });

  let tasksCompleted = 0;
  let pendingTasks = 0;
  let filesSubmitted = 0;
  let progress = 0;
  let rank = null;
  let teamName = null;
  let mentors = [];

  if (membership) {
    const teamId = membership.team.id;
    teamName = membership.team.name;
    progress = membership.team.progress;
    mentors = mergeTeamMentors(membership.team).map((m) => ({
      name: m.name,
      title: m.title,
    }));

    tasksCompleted = await prisma.task.count({
      where: { teamId, column: "completed" },
    });
    pendingTasks = await prisma.task.count({
      where: { teamId, column: { not: "completed" } },
    });
    filesSubmitted = await prisma.submission.count({
      where: { teamId, status: { not: "DRAFT" } },
    });

    const leaderboard = await buildLeaderboard();
    const mine = leaderboard.find((r) => r.teamId === teamId);
    rank = mine?.rank ?? null;
  }

  if (user.role === "ADMIN") {
    const [participants, teams, mentorsCount, judgesCount, announcementsCount, submitted, pending] =
      await Promise.all([
        prisma.user.count({ where: { role: "PARTICIPANT" } }),
        prisma.team.count(),
        prisma.user.count({ where: { role: "MENTOR" } }),
        prisma.user.count({ where: { role: "JUDGE", emailVerifiedAt: { not: null } } }),
        prisma.announcement.count(),
        prisma.submission.count({ where: { status: { in: ["SUBMITTED", "FINAL", "UNDER_REVIEW"] } } }),
        prisma.submission.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
      ]);
    return send(res, 200, {
      role: "ADMIN",
      user: { name: user.name },
      programme: { ...EVENT, daysRemaining: daysRemaining() },
      overview: {
        participants,
        teams,
        mentors: mentorsCount,
        judges: judgesCount,
        announcements: announcementsCount,
        projectsSubmitted: submitted,
        pendingSubmissions: pending,
      },
    });
  }

  if (user.role === "JUDGE") {
    const [submitted, pending, scoredByMe, announcementsCount] = await Promise.all([
      prisma.submission.count({
        where: { status: { in: ["SUBMITTED", "FINAL", "UNDER_REVIEW"] } },
      }),
      prisma.submission.count({
        where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
      }),
      prisma.score.count({ where: { judgeId: user.id } }),
      prisma.announcement.count(),
    ]);
    return send(res, 200, {
      role: "JUDGE",
      user: { name: user.name },
      programme: { ...EVENT, daysRemaining: daysRemaining() },
      overview: {
        projectsSubmitted: submitted,
        pendingReviews: pending,
        scoredByMe,
        announcements: announcementsCount,
      },
    });
  }

  if (user.role === "MENTOR") {
    const teamIds = await getMentorAssignments(user.id);
    const assignedTeams = teamIds.length
      ? await prisma.team.findMany({
          where: { id: { in: teamIds } },
          orderBy: { name: "asc" },
        })
      : [];
    const unreadMessages = await prisma.chatMessage.count({
      where: {
        channel: "mentor",
        teamId: { in: teamIds },
        NOT: { authorId: user.id },
      },
    });
    const pendingReviews = await prisma.submission.count({
      where: {
        teamId: { in: teamIds },
        status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
      },
    });
    return send(res, 200, {
      role: "MENTOR",
      user: { name: user.name },
      programme: { ...EVENT, daysRemaining: daysRemaining() },
      overview: {
        assignedTeams: assignedTeams.map((t) => t.name),
        totalTeams: assignedTeams.length,
        unreadMessages,
        pendingReviews,
      },
    });
  }

  return send(res, 200, {
    role: "PARTICIPANT",
    user: publicUser(user),
    programme: { ...EVENT, daysRemaining: daysRemaining() },
    team: teamName,
    mentors,
    stats: {
      tasksCompleted,
      pendingTasks,
      announcements,
      filesSubmitted,
      currentRank: rank,
      projectProgress: progress,
      unreadNotifications: unread,
    },
  });
}

async function buildLeaderboard() {
  const teams = await prisma.team.findMany({
    include: {
      members: { include: { user: true } },
      mentors: { include: { mentor: true } },
      mentor: true,
      challenge: true,
      submissions: {
        include: {
          scores: { include: { judge: { select: { role: true } } } },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  const rows = teams.map((team) => {
    const published = team.submissions.filter(
      (s) => s.status === "FINAL" || Boolean(s.scoresPublishedAt)
    );
    const scores = published.flatMap((s) =>
      s.scores.filter((sc) => !sc.judge || sc.judge.role === "JUDGE")
    );
    const latest = published[0] || team.submissions[0] || null;
    const avg =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, s) => sum + s.total, 0) / scores.length
          )
        : null;
    if (avg == null) return null;
    return {
      teamId: team.id,
      team: team.name,
      score: avg,
      progress: team.progress,
      project: latest?.title || null,
      challenge: team.challenge?.title || null,
      members: team.members.map((m) => m.user.name),
      mentors: [
        ...(team.mentor ? [team.mentor.name] : []),
        ...team.mentors.map((m) => m.mentor.name),
      ].filter((n, i, arr) => arr.indexOf(n) === i),
    };
  }).filter(Boolean);

  rows.sort((a, b) => b.score - a.score);
  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

async function handleLeaderboard(_req, res) {
  const leaderboard = await buildLeaderboard();
  send(res, 200, {
    leaderboard,
    updatedAt: new Date().toISOString(),
    source: "database",
  });
}

async function handleSetLeaderboardScore(req, res) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  return send(res, 403, {
    error:
      "Leaderboard scores come from judges. Administrators cannot grade projects.",
  });
}

async function handleAnnouncements(req, res) {
  const user = await requireUser(req);

  const items = await prisma.announcement.findMany({
    include: { author: true },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });

  const audienceForRole = {
    ADMIN: null,
    MENTOR: ["general", "mentors"],
    JUDGE: ["general", "judges"],
    PARTICIPANT: ["general", "teams"],
  };
  const allowed = user ? audienceForRole[user.role] : ["general"];
  const visible =
    !allowed
      ? items
      : items.filter((a) => allowed.includes(a.audience || "general"));

  let readIds = new Set();
  if (user) {
    const reads = await prisma.notification.findMany({
      where: {
        userId: user.id,
        category: "announcement",
        readAt: { not: null },
      },
      select: { title: true },
    });
    readIds = new Set(reads.map((r) => r.title));
  }

  const audienceLabel = {
    general: "Everyone",
    mentors: "Mentors",
    judges: "Judges",
    teams: "Teams",
  };

  send(res, 200, {
    source: "database",
    updatedAt: new Date().toISOString(),
    announcements: visible.map((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      type: a.type,
      audience: a.audience || "general",
      audienceLabel: audienceLabel[a.audience] || "Everyone",
      pinned: a.pinned,
      author: a.author?.name || "Organizers",
      date: a.createdAt.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      time: a.createdAt.toISOString(),
      unread: user ? !readIds.has(a.title) : false,
    })),
  });
}

function dashboardPathForRole(role) {
  if (role === "ADMIN") return "/admin";
  if (role === "MENTOR") return "/mentor";
  if (role === "JUDGE") return "/judge";
  return "/dashboard";
}

function announcementRecipientWhere(audience, authorId) {
  const base = {
    emailVerifiedAt: { not: null },
    NOT: { id: authorId },
  };
  if (audience === "mentors") return { ...base, role: "MENTOR" };
  if (audience === "judges") return { ...base, role: "JUDGE" };
  if (audience === "teams") return { ...base, role: "PARTICIPANT" };
  return base;
}

async function handleCreateAnnouncement(req, res, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN") return send(res, 403, { error: "Admins only." });

  const title = String(body.title || "").trim();
  const bodyText = String(body.body || "").trim();
  if (!title || !bodyText) {
    return send(res, 400, { error: "Title and body are required." });
  }

  const audienceRaw = String(body.audience || "general").trim().toLowerCase();
  const audience = ["general", "mentors", "judges", "teams"].includes(audienceRaw)
    ? audienceRaw
    : "general";

  const item = await prisma.announcement.create({
    data: {
      title,
      body: bodyText,
      type: String(body.type || "update"),
      audience,
      pinned: Boolean(body.pinned),
      authorId: user.id,
    },
  });

  const recipients = await prisma.user.findMany({
    where: announcementRecipientWhere(audience, user.id),
    select: { id: true, email: true, name: true, role: true },
  });

  if (recipients.length) {
    await prisma.notification.createMany({
      data: recipients.map((p) => ({
        userId: p.id,
        title: item.title,
        body: item.body.slice(0, 120),
        category: "announcement",
        href: "/announcements",
      })),
    });
  }

  const brief =
    bodyText.length > 120 ? `${bodyText.slice(0, 120).trim()}…` : bodyText;
  const baseUrl = frontendBaseUrl(req);

  let emailed = 0;
  let emailError = null;
  if (recipients.length) {
    const results = await Promise.allSettled(
      recipients.map((person) =>
        sendAnnouncementEmail({
          toEmail: person.email,
          toName: person.name,
          title: item.title,
          preview: brief,
          dashboardUrl: `${baseUrl}${dashboardPathForRole(person.role)}`,
        })
      )
    );
    emailed = results.filter((r) => r.status === "fulfilled").length;
    const firstFail = results.find((r) => r.status === "rejected");
    if (firstFail && firstFail.status === "rejected") {
      emailError = firstFail.reason?.message || "Could not send some emails.";
      console.error("Announcement email failed:", firstFail.reason);
    }
  }

  send(res, 201, {
    announcement: item,
    emailed,
    recipients: recipients.length,
    emailError,
  });
}

async function handleNotifications(req, res) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });

  const items = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  const allowed = allowedCategoriesFromPrefs(user.notificationPrefs);
  const filtered =
    allowed == null
      ? items
      : items.filter((n) => allowed.has(n.category));

  send(res, 200, {
    notifications: filtered.slice(0, 50).map((n) => ({
      id: n.id,
      title: n.title,
      text: n.body,
      category: n.category,
      href: n.href || "/notifications",
      unread: !n.readAt,
      time: relativeTime(n.createdAt),
      createdAt: n.createdAt,
    })),
  });
}

async function handleReadNotifications(req, res, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });

  if (body.id) {
    await prisma.notification.updateMany({
      where: { id: String(body.id), userId: user.id },
      data: { readAt: new Date() },
    });
  } else {
    await prisma.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
  }
  send(res, 200, { ok: true });
}

async function handleClearNotifications(req, res, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });

  if (body?.id) {
    const result = await prisma.notification.deleteMany({
      where: { id: String(body.id), userId: user.id },
    });
    if (!result.count) {
      return send(res, 404, { error: "Notification not found." });
    }
    return send(res, 200, { ok: true, cleared: 1 });
  }

  const result = await prisma.notification.deleteMany({
    where: { userId: user.id },
  });
  send(res, 200, { ok: true, cleared: result.count });
}

function relativeTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

async function handleTeamsList(req, res) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });

  const teams = await prisma.team.findMany({
    include: {
      mentors: { include: { mentor: true } },
      mentor: true,
      members: { include: { user: true } },
    },
    orderBy: { name: "asc" },
  });

  send(res, 200, {
    teams: teams.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      locked: t.locked,
      progress: t.progress,
      members: t.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        title: m.title || m.user.title,
        role: m.role,
        online: m.online,
      })),
      mentors: [
        ...(t.mentor ? [t.mentor.name] : []),
        ...t.mentors.map((m) => m.mentor.name),
      ].filter((n, i, a) => a.indexOf(n) === i),
    })),
  });
}

async function handleMyTeam(req, res) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  const membership = await getMembership(user.id);
  if (!membership) return send(res, 404, { error: "You are not on a team yet." });

  const taskCounts = await prisma.task.groupBy({
    by: ["assigneeId"],
    where: { teamId: membership.team.id },
    _count: true,
  });
  const countMap = Object.fromEntries(
    taskCounts.map((t) => [t.assigneeId, t._count])
  );

  send(res, 200, {
    isLead: membership.role === "LEAD",
    myRole: membership.role,
    team: {
      id: membership.team.id,
      name: membership.team.name,
      description: membership.team.description,
      progress: membership.team.progress,
      members: membership.team.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        role: m.title || m.user.title || (m.role === "LEAD" ? "Project Lead" : "Member"),
        teamRole: m.role,
        avatar: m.user.avatar,
        online: m.online,
        tasks: countMap[m.userId] || 0,
        email: m.user.email,
      })),
      mentors: mergeTeamMentors(membership.team),
    },
  });
}

async function handleResponsibilities(req, res) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  const membership = await getMembership(user.id);
  if (!membership) return send(res, 404, { error: "Join a team first." });

  if (membership.role === "LEAD") {
    await ensureDefaultResponsibilities(membership.team.id, user.id);
  }

  const responsibilities = await prisma.teamResponsibility.findMany({
    where: { teamId: membership.team.id },
    include: { user: true },
    orderBy: { sortOrder: "asc" },
  });

  send(res, 200, {
    isLead: membership.role === "LEAD",
    members: membership.team.members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      teamRole: m.role,
    })),
    responsibilities: responsibilities.map((r) => ({
      id: r.id,
      label: r.label,
      userId: r.userId,
      name: r.user?.name || "",
      avatar: r.user?.avatar || null,
    })),
  });
}

async function handleSaveResponsibilities(req, res, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  const membership = await getMembership(user.id);
  if (!membership) return send(res, 404, { error: "Join a team first." });
  if (membership.role !== "LEAD") {
    return send(res, 403, {
      error: "Only the Project Lead can create roles and assign teammates.",
    });
  }

  const items = Array.isArray(body.responsibilities) ? body.responsibilities : null;
  if (!items) {
    return send(res, 400, { error: "responsibilities array required." });
  }

  const memberIds = new Set(membership.team.members.map((m) => m.userId));
  const teamId = membership.team.id;

  await prisma.$transaction(async (tx) => {
    await tx.teamResponsibility.deleteMany({ where: { teamId } });
    for (let i = 0; i < items.length; i++) {
      const label = String(items[i].label || "").trim();
      if (!label) continue;
      let userId = items[i].userId ? String(items[i].userId) : null;
      if (userId && !memberIds.has(userId)) userId = null;
      await tx.teamResponsibility.create({
        data: { teamId, label, userId, sortOrder: i },
      });
    }
  });

  return handleResponsibilities(req, res);
}

async function handleTasks(req, res) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  const membership = await getMembership(user.id);
  if (!membership) return send(res, 404, { error: "Join a team first." });

  const tasks = await prisma.task.findMany({
    where: { teamId: membership.team.id },
    include: { assignee: true },
    orderBy: [{ column: "asc" }, { sortOrder: "asc" }],
  });

  const columns = {
    ideas: [],
    todo: [],
    inProgress: [],
    testing: [],
    completed: [],
  };

  for (const t of tasks) {
    const urls = Array.isArray(t.attachmentUrls) ? t.attachmentUrls : [];
    columns[t.column].push({
      id: t.id,
      title: t.title,
      assigneeId: t.assigneeId,
      assignee: t.assignee?.name || "Unassigned",
      assignees: t.assignee ? [t.assignee.name] : [],
      due: t.dueDate || "",
      priority: t.priority,
      comments: t.comments,
      attachments: urls.length || t.attachments || 0,
      attachmentUrls: urls,
      labels: [],
      canMove:
        membership.role === "LEAD" ||
        t.assigneeId === user.id,
    });
  }

  send(res, 200, {
    isLead: membership.role === "LEAD",
    me: { id: user.id, name: user.name },
    members: membership.team.members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
    })),
    columns,
  });
}

async function handleCreateTask(req, res, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  const membership = await getMembership(user.id);
  if (!membership) return send(res, 404, { error: "Join a team first." });
  if (membership.role !== "LEAD") {
    return send(res, 403, {
      error: "Only the Project Lead can create and assign Kanban tasks.",
    });
  }

  const title = String(body.title || "").trim();
  if (!title) return send(res, 400, { error: "Task title is required." });

  const column = String(body.column || "todo");
  const allowed = ["ideas", "todo", "inProgress", "testing", "completed"];
  if (!allowed.includes(column)) {
    return send(res, 400, { error: "Invalid column." });
  }

  let assigneeId = body.assigneeId ? String(body.assigneeId) : null;
  if (assigneeId) {
    const onTeam = membership.team.members.some((m) => m.userId === assigneeId);
    if (!onTeam) {
      return send(res, 400, { error: "Assignee must be on your team." });
    }
  }

  const priority = ["High", "Medium", "Low"].includes(body.priority)
    ? body.priority
    : "Medium";

  const maxOrder = await prisma.task.aggregate({
    where: { teamId: membership.team.id, column },
    _max: { sortOrder: true },
  });

  const task = await prisma.task.create({
    data: {
      teamId: membership.team.id,
      title,
      column,
      priority,
      dueDate: body.dueDate ? String(body.dueDate) : null,
      assigneeId,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
    include: { assignee: true },
  });

  if (assigneeId && assigneeId !== user.id) {
    await notify(assigneeId, {
      title: "New task assigned",
      body: `${user.name} assigned you “${title}” on the Kanban board.`,
      category: "task",
      href: "/kanban",
    });
  }

  send(res, 201, {
    task: {
      id: task.id,
      title: task.title,
      assigneeId: task.assigneeId,
      assignee: task.assignee?.name || "Unassigned",
      assignees: task.assignee ? [task.assignee.name] : [],
      due: task.dueDate || "",
      priority: task.priority,
      comments: task.comments,
      attachments: 0,
      attachmentUrls: [],
      labels: [],
      column: task.column,
      canMove: true,
    },
  });
}

async function handleMoveTask(req, res, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  const membership = await getMembership(user.id);
  if (!membership) return send(res, 404, { error: "Join a team first." });

  const id = String(body.id || "");
  const column = String(body.column || "");
  const allowed = ["ideas", "todo", "inProgress", "testing", "completed"];
  if (!allowed.includes(column)) {
    return send(res, 400, { error: "Invalid column." });
  }

  const task = await prisma.task.findFirst({
    where: { id, teamId: membership.team.id },
  });
  if (!task) return send(res, 404, { error: "Task not found." });

  const isLead = membership.role === "LEAD";
  const isAssignee = task.assigneeId === user.id;
  if (!isLead && !isAssignee) {
    return send(res, 403, {
      error: "You can only update progress on tasks assigned to you.",
    });
  }

  const data = {
    column,
    sortOrder: Number(body.sortOrder || 0),
  };

  if (isLead && body.assigneeId !== undefined) {
    const nextAssignee = body.assigneeId ? String(body.assigneeId) : null;
    if (nextAssignee) {
      const onTeam = membership.team.members.some((m) => m.userId === nextAssignee);
      if (!onTeam) {
        return send(res, 400, { error: "Assignee must be on your team." });
      }
    }
    data.assigneeId = nextAssignee;
  }

  const updated = await prisma.task.update({
    where: { id },
    data,
  });

  send(res, 200, { task: updated });
}

async function handleTaskComments(req, res, taskId) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  const membership = await getMembership(user.id);
  if (!membership) return send(res, 404, { error: "Join a team first." });

  const task = await prisma.task.findFirst({
    where: { id: taskId, teamId: membership.team.id },
  });
  if (!task) return send(res, 404, { error: "Task not found." });

  const comments = await prisma.taskComment.findMany({
    where: { taskId },
    include: { author: true },
    orderBy: { createdAt: "asc" },
  });

  send(res, 200, {
    comments: comments.map((c) => ({
      id: c.id,
      body: c.body,
      author: c.author.name,
      authorId: c.authorId,
      createdAt: c.createdAt,
    })),
  });
}

async function handlePostTaskComment(req, res, body, taskId) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  const membership = await getMembership(user.id);
  if (!membership) return send(res, 404, { error: "Join a team first." });

  const task = await prisma.task.findFirst({
    where: { id: taskId, teamId: membership.team.id },
  });
  if (!task) return send(res, 404, { error: "Task not found." });

  const text = String(body.body || "").trim();
  if (!text) return send(res, 400, { error: "Comment cannot be empty." });

  const comment = await prisma.taskComment.create({
    data: { taskId, authorId: user.id, body: text },
    include: { author: true },
  });

  await prisma.task.update({
    where: { id: taskId },
    data: { comments: { increment: 1 } },
  });

  send(res, 201, {
    comment: {
      id: comment.id,
      body: comment.body,
      author: comment.author.name,
      authorId: comment.authorId,
      createdAt: comment.createdAt,
    },
  });
}

async function handleUpload(req, res, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });

  const filename = safeFilename(body.filename || "file");
  const dataBase64 = String(body.dataBase64 || "");
  if (!dataBase64) {
    return send(res, 400, { error: "File data is required." });
  }

  let buffer;
  try {
    buffer = Buffer.from(dataBase64, "base64");
  } catch {
    return send(res, 400, { error: "Invalid file data." });
  }

  const maxBytes = 8 * 1024 * 1024;
  if (!buffer.length || buffer.length > maxBytes) {
    return send(res, 400, { error: "File must be between 1 byte and 8 MB." });
  }

  ensureUploadDir();
  const storedName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${filename}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, storedName), buffer);

  send(res, 201, {
    url: publicUploadUrl(req, storedName),
    filename: storedName,
    size: buffer.length,
  });
}

async function handleAttachTaskFile(req, res, body, taskId) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  const membership = await getMembership(user.id);
  if (!membership) return send(res, 404, { error: "Join a team first." });

  const task = await prisma.task.findFirst({
    where: { id: taskId, teamId: membership.team.id },
  });
  if (!task) return send(res, 404, { error: "Task not found." });

  const canEdit =
    membership.role === "LEAD" || task.assigneeId === user.id;
  if (!canEdit) {
    return send(res, 403, {
      error: "Only the assignee or Project Lead can attach files.",
    });
  }

  const url = String(body.url || "").trim();
  if (!url) return send(res, 400, { error: "File URL required." });

  const current = Array.isArray(task.attachmentUrls)
    ? [...task.attachmentUrls]
    : [];
  current.push(url);

  const updated = await prisma.task.update({
    where: { id: task.id },
    data: {
      attachmentUrls: current,
      attachments: current.length,
    },
  });

  send(res, 200, {
    task: {
      id: updated.id,
      attachments: current.length,
      attachmentUrls: current,
    },
  });
}

async function handleWorkspace(req, res) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  const membership = await getMembership(user.id);
  if (!membership) return send(res, 404, { error: "Join a team first." });

  await ensureDefaultWorkspaceDocs(membership.team.id);

  const docs = await prisma.workspaceDoc.findMany({
    where: { teamId: membership.team.id },
    orderBy: { createdAt: "asc" },
  });

  send(res, 200, {
    sections: docs.map((d) => ({
      id: d.sectionId,
      title: d.title,
      content: d.content,
      updatedAt: d.updatedAt,
    })),
  });
}

async function handleCreateWorkspaceSection(req, res, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  const membership = await getMembership(user.id);
  if (!membership) return send(res, 404, { error: "Join a team first." });

  const title = String(body.title || "").trim() || "Untitled";
  const sectionId = `section-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  const doc = await prisma.workspaceDoc.create({
    data: {
      teamId: membership.team.id,
      sectionId,
      title,
      content: "",
      updatedById: user.id,
    },
  });

  send(res, 201, {
    section: {
      id: doc.sectionId,
      title: doc.title,
      content: doc.content,
      updatedAt: doc.updatedAt,
    },
  });
}

async function handleSaveWorkspace(req, res, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  const membership = await getMembership(user.id);
  if (!membership) return send(res, 404, { error: "Join a team first." });

  const sectionId = String(body.sectionId || "");
  const content = String(body.content ?? "");
  if (!sectionId) return send(res, 400, { error: "sectionId required." });

  const existing = await prisma.workspaceDoc.findUnique({
    where: {
      teamId_sectionId: {
        teamId: membership.team.id,
        sectionId,
      },
    },
  });

  const title = body.title
    ? String(body.title).trim()
    : existing?.title || sectionId;

  const doc = await prisma.workspaceDoc.upsert({
    where: {
      teamId_sectionId: {
        teamId: membership.team.id,
        sectionId,
      },
    },
    update: {
      content,
      updatedById: user.id,
      ...(body.title ? { title } : {}),
    },
    create: {
      teamId: membership.team.id,
      sectionId,
      title,
      content,
      updatedById: user.id,
    },
  });

  send(res, 200, {
    section: {
      id: doc.sectionId,
      title: doc.title,
      content: doc.content,
      updatedAt: doc.updatedAt,
    },
  });
}

async function handleChat(req, res, channel) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });

  if (channel === "judges") {
    if (user.role !== "JUDGE") {
      return send(res, 403, { error: "Judges chat is for judges only." });
    }
    const messages = await prisma.chatMessage.findMany({
      where: { channel: "judges", teamId: null },
      include: {
        author: true,
        reactions: true,
        forwardedFrom: { include: { author: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 300,
    });
    const judges = await prisma.user.findMany({
      where: { role: "JUDGE", emailVerifiedAt: { not: null } },
      select: { id: true, name: true, title: true, avatar: true },
      orderBy: { name: "asc" },
    });
    return send(res, 200, {
      teamId: null,
      teamName: "Judges",
      mentors: [],
      members: judges.map((j) => ({
        id: j.id,
        name: j.name,
        title: j.title || "Judge",
        avatar: j.avatar,
      })),
      messages: messages.map((m) => serializeChatMessage(m, user.id)),
    });
  }

  if (channel === "staff") {
    if (user.role !== "JUDGE" && user.role !== "ADMIN") {
      return send(res, 403, { error: "Staff chat is for judges and admins." });
    }
    const messages = await prisma.chatMessage.findMany({
      where: { channel: "staff", teamId: null },
      include: {
        author: true,
        reactions: true,
        forwardedFrom: { include: { author: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 300,
    });
    const members = await prisma.user.findMany({
      where: {
        role: { in: ["JUDGE", "ADMIN"] },
        emailVerifiedAt: { not: null },
      },
      select: { id: true, name: true, title: true, avatar: true, role: true },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    });
    return send(res, 200, {
      teamId: null,
      teamName: "Judges & Admins",
      mentors: [],
      members: members.map((m) => ({
        id: m.id,
        name: m.name,
        title:
          m.title ||
          (m.role === "ADMIN" ? "Administrator" : "Judge"),
        avatar: m.avatar,
        role: m.role,
      })),
      messages: messages.map((m) => serializeChatMessage(m, user.id)),
    });
  }

  const membership = await getMembership(user.id);
  if (!membership && user.role === "PARTICIPANT") {
    return send(res, 404, { error: "Join a team first." });
  }

  const url = new URL(req.url || "/", "http://localhost");
  let teamId = url.searchParams.get("teamId") || membership?.team.id || null;

  if (!teamId && user.role === "MENTOR") {
    const assigned = await getMentorAssignments(user.id);
    teamId = assigned[0] || null;
  }
  if (!teamId) return send(res, 400, { error: "Team required." });

  if (user.role === "MENTOR") {
    const ok = await mentorCanAccessTeam(user.id, teamId);
    if (!ok && channel === "mentor") {
      return send(res, 403, { error: "Not assigned to this team." });
    }
  }

  if (user.role === "PARTICIPANT" && membership?.team.id !== teamId) {
    return send(res, 403, { error: "Not your team." });
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: { include: { user: true } },
      mentors: { include: { mentor: true } },
      mentor: true,
    },
  });
  if (!team) return send(res, 404, { error: "Team not found." });

  const messages = await prisma.chatMessage.findMany({
    where: { teamId, channel },
    include: {
      author: true,
      reactions: true,
      forwardedFrom: { include: { author: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  send(res, 200, {
    teamId: team.id,
    teamName: team.name,
    mentors: mergeTeamMentors(team),
    members: team.members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      title: m.title || m.user.title,
      avatar: m.user.avatar,
    })),
    messages: messages.map((m) => serializeChatMessage(m, user.id)),
  });
}

function serializeChatMessage(m, viewerId) {
  const deleted = Boolean(m.deletedAt);
  const reactionMap = new Map();
  for (const r of m.reactions || []) {
    const entry = reactionMap.get(r.emoji) || {
      emoji: r.emoji,
      count: 0,
      mine: false,
    };
    entry.count += 1;
    if (r.userId === viewerId) entry.mine = true;
    reactionMap.set(r.emoji, entry);
  }

  return {
    id: m.id,
    userId: m.authorId,
    user: m.author?.name || "Unknown",
    avatar:
      m.author?.avatar ||
      (m.author?.name || "?").slice(0, 2).toUpperCase(),
    time: m.createdAt.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    text: deleted ? "This message was deleted" : m.body,
    deleted,
    mine: m.authorId === viewerId,
    forwarded: Boolean(m.forwardedFromId),
    forwardedFrom: m.forwardedFrom
      ? {
          user: m.forwardedFrom.author?.name || "Unknown",
          text: m.forwardedFrom.deletedAt
            ? "Original message was deleted"
            : m.forwardedFrom.body,
        }
      : null,
    reactions: [...reactionMap.values()],
  };
}

async function assertChatAccess(user, teamId, channel) {
  if (channel === "judges") {
    if (user.role === "JUDGE") {
      return { ok: true, membership: null };
    }
    return { ok: false, status: 403, error: "Judges chat is for judges only." };
  }

  if (channel === "staff") {
    if (user.role === "JUDGE" || user.role === "ADMIN") {
      return { ok: true, membership: null };
    }
    return {
      ok: false,
      status: 403,
      error: "Staff chat is for judges and admins.",
    };
  }

  const membership = await getMembership(user.id);

  if (user.role === "PARTICIPANT") {
    if (!membership || membership.team.id !== teamId) {
      return { ok: false, status: 403, error: "Not your team." };
    }
    return { ok: true, membership };
  }

  if (user.role === "MENTOR") {
    if (channel === "team") {
      return { ok: false, status: 403, error: "Mentors use mentorship chat." };
    }
    const ok = await mentorCanAccessTeam(user.id, teamId);
    if (!ok) return { ok: false, status: 403, error: "Not assigned to this team." };
    return { ok: true, membership };
  }

  if (user.role === "ADMIN") {
    return { ok: true, membership };
  }

  return { ok: false, status: 403, error: "Forbidden." };
}

async function handleReactChat(req, res, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });

  const messageId = String(body.messageId || "").trim();
  const emoji = String(body.emoji || "").trim();
  const allowed = ["👍", "❤️", "😂", "😮", "😢", "🙏"];
  if (!messageId) return send(res, 400, { error: "messageId required." });
  if (!allowed.includes(emoji)) {
    return send(res, 400, { error: "Unsupported reaction." });
  }

  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
  });
  if (!message || message.deletedAt) {
    return send(res, 404, { error: "Message not found." });
  }

  const access = await assertChatAccess(user, message.teamId, message.channel);
  if (!access.ok) return send(res, access.status, { error: access.error });

  const existing = await prisma.chatReaction.findUnique({
    where: {
      messageId_userId: { messageId, userId: user.id },
    },
  });

  if (existing && existing.emoji === emoji) {
    await prisma.chatReaction.delete({ where: { id: existing.id } });
  } else if (existing) {
    await prisma.chatReaction.update({
      where: { id: existing.id },
      data: { emoji },
    });
  } else {
    await prisma.chatReaction.create({
      data: { messageId, userId: user.id, emoji },
    });
  }

  const refreshed = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: {
      author: true,
      reactions: true,
      forwardedFrom: { include: { author: true } },
    },
  });

  send(res, 200, { message: serializeChatMessage(refreshed, user.id) });
}

async function handleDeleteChat(req, res, messageId) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });

  const id = String(messageId || "").trim();
  if (!id) return send(res, 400, { error: "Message id required." });

  const message = await prisma.chatMessage.findUnique({ where: { id } });
  if (!message || message.deletedAt) {
    return send(res, 404, { error: "Message not found." });
  }

  const access = await assertChatAccess(user, message.teamId, message.channel);
  if (!access.ok) return send(res, access.status, { error: access.error });

  if (message.authorId !== user.id && user.role !== "ADMIN") {
    return send(res, 403, { error: "You can only delete your own messages." });
  }

  const updated = await prisma.chatMessage.update({
    where: { id },
    data: { deletedAt: new Date() },
    include: {
      author: true,
      reactions: true,
      forwardedFrom: { include: { author: true } },
    },
  });

  send(res, 200, { message: serializeChatMessage(updated, user.id) });
}

async function handleForwardChat(req, res, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });

  const messageId = String(body.messageId || "").trim();
  const targetChannel = String(body.channel || "").trim();
  if (!messageId) return send(res, 400, { error: "messageId required." });
  if (targetChannel !== "team" && targetChannel !== "mentor") {
    return send(res, 400, { error: "channel must be team or mentor." });
  }

  const original = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: { author: true },
  });
  if (!original || original.deletedAt) {
    return send(res, 404, { error: "Message not found." });
  }

  const sourceAccess = await assertChatAccess(
    user,
    original.teamId,
    original.channel
  );
  if (!sourceAccess.ok) {
    return send(res, sourceAccess.status, { error: sourceAccess.error });
  }

  const targetAccess = await assertChatAccess(
    user,
    original.teamId,
    targetChannel
  );
  if (!targetAccess.ok) {
    return send(res, targetAccess.status, { error: targetAccess.error });
  }

  // Mentors don't post into team chat
  if (user.role === "MENTOR" && targetChannel === "team") {
    return send(res, 403, {
      error: "Mentors can only forward within Mentorship chat.",
    });
  }

  const created = await prisma.chatMessage.create({
    data: {
      teamId: original.teamId,
      channel: targetChannel,
      authorId: user.id,
      body: original.body,
      forwardedFromId: original.id,
    },
    include: {
      author: true,
      reactions: true,
      forwardedFrom: { include: { author: true } },
    },
  });

  send(res, 201, {
    message: serializeChatMessage(created, user.id),
    channel: targetChannel,
  });
}

async function handlePostChat(req, res, body, channel) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });

  const text = String(body.text || body.body || "").trim();
  if (!text) return send(res, 400, { error: "Message required." });

  if (channel === "judges") {
    if (user.role !== "JUDGE") {
      return send(res, 403, { error: "Judges chat is for judges only." });
    }
    const message = await prisma.chatMessage.create({
      data: {
        teamId: null,
        channel: "judges",
        authorId: user.id,
        body: text,
      },
      include: {
        author: true,
        reactions: true,
        forwardedFrom: { include: { author: true } },
      },
    });
    const judges = await prisma.user.findMany({
      where: {
        role: "JUDGE",
        emailVerifiedAt: { not: null },
        NOT: { id: user.id },
      },
      select: { id: true },
    });
    if (judges.length) {
      await prisma.notification.createMany({
        data: judges.map((j) => ({
          userId: j.id,
          title: "Judges chat",
          body: `${user.name}: ${text.slice(0, 120)}`,
          category: "chat",
          href: "/judge/chat",
        })),
      });
    }
    return send(res, 201, {
      message: serializeChatMessage(message, user.id),
    });
  }

  if (channel === "staff") {
    if (user.role !== "JUDGE" && user.role !== "ADMIN") {
      return send(res, 403, { error: "Staff chat is for judges and admins." });
    }
    const message = await prisma.chatMessage.create({
      data: {
        teamId: null,
        channel: "staff",
        authorId: user.id,
        body: text,
      },
      include: {
        author: true,
        reactions: true,
        forwardedFrom: { include: { author: true } },
      },
    });
    const peers = await prisma.user.findMany({
      where: {
        role: { in: ["JUDGE", "ADMIN"] },
        emailVerifiedAt: { not: null },
        NOT: { id: user.id },
      },
      select: { id: true, role: true },
    });
    if (peers.length) {
      await prisma.notification.createMany({
        data: peers.map((p) => ({
          userId: p.id,
          title: "Judges & admins chat",
          body: `${user.name}: ${text.slice(0, 120)}`,
          category: "chat",
          href: p.role === "ADMIN" ? "/admin/judge-chat" : "/judge/staff-chat",
        })),
      });
    }
    return send(res, 201, {
      message: serializeChatMessage(message, user.id),
    });
  }

  const membership = await getMembership(user.id);
  let teamId = body.teamId ? String(body.teamId) : membership?.team.id || null;

  if (!teamId && user.role === "MENTOR") {
    const assigned = await getMentorAssignments(user.id);
    teamId = assigned[0] || null;
  }
  if (!teamId) return send(res, 400, { error: "Team required." });

  if (user.role === "PARTICIPANT") {
    if (!membership || membership.team.id !== teamId) {
      return send(res, 403, { error: "Not your team." });
    }
  }

  if (user.role === "MENTOR") {
    const ok = await mentorCanAccessTeam(user.id, teamId);
    if (!ok) return send(res, 403, { error: "Not assigned to this team." });
  }

  const message = await prisma.chatMessage.create({
    data: {
      teamId,
      channel,
      authorId: user.id,
      body: text,
    },
    include: {
      author: true,
      reactions: true,
      forwardedFrom: { include: { author: true } },
    },
  });

  const recipientIds = new Set();
  const members = await prisma.teamMember.findMany({
    where: { teamId, NOT: { userId: user.id } },
    select: { userId: true },
  });
  for (const m of members) recipientIds.add(m.userId);

  if (channel === "mentor") {
    const teamMentors = await prisma.teamMentor.findMany({
      where: { teamId, NOT: { mentorId: user.id } },
      select: { mentorId: true },
    });
    for (const m of teamMentors) recipientIds.add(m.mentorId);
    const primary = await prisma.team.findFirst({
      where: { id: teamId, mentorId: { not: null } },
      select: { mentorId: true },
    });
    if (primary?.mentorId && primary.mentorId !== user.id) {
      recipientIds.add(primary.mentorId);
    }
  }

  if (recipientIds.size) {
    await prisma.notification.createMany({
      data: [...recipientIds].map((userId) => ({
        userId,
        title: channel === "mentor" ? "Mentor chat" : "Team chat",
        body: `${user.name}: ${text.slice(0, 120)}`,
        category: channel === "mentor" ? "mentor" : "chat",
        href: channel === "mentor" ? "/mentor-chat" : "/team-chat",
      })),
    });
  }

  send(res, 201, {
    message: serializeChatMessage(message, user.id),
  });
}

async function handleSubmission(req, res) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  const membership = await getMembership(user.id);
  if (!membership) return send(res, 404, { error: "Join a team first." });

  const submission = await prisma.submission.findFirst({
    where: { teamId: membership.team.id },
    include: {
      scores: {
        orderBy: { updatedAt: "desc" },
        include: {
          judge: { select: { id: true, name: true, role: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!submission) {
    return send(res, 200, {
      submission: null,
      isLead: membership.role === "LEAD",
      canSubmit: membership.role === "LEAD",
      judgeReviews: [],
      scoresPublished: false,
    });
  }

  const scoresPublished =
    submission.status === "FINAL" || Boolean(submission.scoresPublishedAt);
  const judgeScores = submission.scores.filter(
    (sc) => sc.judge?.role === "JUDGE"
  );
  const average =
    judgeScores.length > 0
      ? Math.round(
          judgeScores.reduce((sum, sc) => sum + sc.total, 0) / judgeScores.length
        )
      : null;

  const judgeReviews = judgeScores.map((sc) => ({
    judgeId: sc.judgeId,
    judgeName: sc.judge?.name || "Judge",
    notes: sc.notes,
    updatedAt: sc.updatedAt,
    completed: true,
    ...(scoresPublished
      ? { total: sc.total, breakdown: scoreBreakdown(sc) }
      : {}),
  }));

  const { scores, ...submissionPublic } = submission;

  send(res, 200, {
    submission: submissionPublic,
    isLead: membership.role === "LEAD",
    canSubmit: membership.role === "LEAD",
    reviewStatus:
      submission.status === "DRAFT"
        ? "draft"
        : scoresPublished
          ? "complete"
          : submission.status === "SUBMITTED"
            ? "pending"
            : "in_review",
    scoresPublished,
    publishedAverage: scoresPublished ? average : null,
    judgeReviews,
  });
}

async function handleSaveSubmission(req, res, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  const membership = await getMembership(user.id);
  if (!membership) return send(res, 404, { error: "Join a team first." });
  if (membership.role !== "LEAD") {
    return send(res, 403, {
      error: "Only the Project Lead can submit the project.",
    });
  }

  const challengeId =
    membership.team.challengeId ||
    (await prisma.challenge.findFirst({ select: { id: true } }))?.id;
  if (!challengeId) {
    return send(res, 400, { error: "No challenge available." });
  }

  const existing = await prisma.submission.findFirst({
    where: { teamId: membership.team.id },
    orderBy: { updatedAt: "desc" },
  });

  const data = {
    title: String(body.title || body.name || existing?.title || "Untitled project"),
    description: body.description ?? existing?.description,
    repoUrl: body.github ?? body.repoUrl ?? existing?.repoUrl,
    demoUrl: body.demo ?? body.demoUrl ?? existing?.demoUrl,
    deckUrl: body.pitch ?? body.deckUrl ?? existing?.deckUrl,
    slidesUrl: body.slides ?? body.slidesUrl ?? existing?.slidesUrl ?? null,
    videoUrl: body.video ?? body.videoUrl ?? existing?.videoUrl,
    docsUrl: body.docs ?? body.docsUrl ?? existing?.docsUrl,
    prototypeUrl: body.prototype ?? body.prototypeUrl ?? existing?.prototypeUrl,
    zipUrl: body.zip ?? body.zipUrl ?? existing?.zipUrl ?? null,
    authorId: user.id,
  };

  const finalize = Boolean(body.finalize);
  if (finalize) {
    data.status = "SUBMITTED";
    data.submittedAt = new Date();
  }

  const submission = existing
    ? await prisma.submission.update({ where: { id: existing.id }, data })
    : await prisma.submission.create({
        data: {
          ...data,
          teamId: membership.team.id,
          challengeId,
          status: finalize ? "SUBMITTED" : "DRAFT",
          submittedAt: finalize ? new Date() : null,
        },
      });

  if (finalize) {
    await prisma.team.update({
      where: { id: membership.team.id },
      data: { progress: Math.max(membership.team.progress, 85) },
    });
  }

  send(res, 200, { submission });
}

async function handleAdminOverview(req, res) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN") return send(res, 403, { error: "Admins only." });
  return handleDashboard(req, res);
}

async function handleAdminParticipants(req, res) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN") return send(res, 403, { error: "Admins only." });

  const users = await prisma.user.findMany({
    where: { role: "PARTICIPANT" },
    include: { teamMemberships: { include: { team: true } } },
    orderBy: { name: "asc" },
  });

  send(res, 200, {
    participants: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      title: u.title,
      team: u.teamMemberships[0]?.team.name || "Unassigned",
      teamId: u.teamMemberships[0]?.team.id || null,
      teamRole: u.teamMemberships[0]?.role || null,
      online: false,
    })),
  });
}

async function handleAdminDeleteMentor(req, res, mentorId) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN") return send(res, 403, { error: "Admins only." });

  const id = String(mentorId || "").trim();
  if (!id) return send(res, 400, { error: "Mentor id is required." });

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role !== "MENTOR") {
    return send(res, 404, { error: "Mentor not found." });
  }

  if (target.id === user.id) {
    return send(res, 400, { error: "You cannot delete your own account." });
  }

  await prisma.team.updateMany({
    where: { mentorId: target.id },
    data: { mentorId: null },
  });
  await prisma.user.delete({ where: { id: target.id } });
  send(res, 200, { ok: true, id: target.id });
}

async function handleAdminMoveParticipant(req, res, participantId, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN") return send(res, 403, { error: "Admins only." });

  const id = String(participantId || "").trim();
  if (!id) return send(res, 400, { error: "Participant id is required." });

  const target = await prisma.user.findUnique({
    where: { id },
    include: { teamMemberships: { include: { team: true } } },
  });
  if (!target || target.role !== "PARTICIPANT") {
    return send(res, 404, { error: "Participant not found." });
  }

  const currentTeam = target.teamMemberships[0]?.team || null;
  const rawTeamId = body.teamId;
  const nextTeamId =
    rawTeamId === null || rawTeamId === undefined || rawTeamId === ""
      ? null
      : String(rawTeamId).trim();

  if (!nextTeamId) {
    if (!currentTeam) {
      return send(res, 400, { error: "This participant is not on a team." });
    }
    if (currentTeam.locked) {
      return send(res, 400, {
        error: "Unlock teams before removing members.",
      });
    }
    await prisma.teamMember.deleteMany({ where: { userId: target.id } });
    return send(res, 200, {
      ok: true,
      id: target.id,
      teamId: null,
      team: "Unassigned",
      teamRole: null,
    });
  }

  if (currentTeam?.id === nextTeamId) {
    return send(res, 400, {
      error: "This participant is already on that team.",
    });
  }

  const nextTeam = await prisma.team.findUnique({
    where: { id: nextTeamId },
    include: { members: true },
  });
  if (!nextTeam) return send(res, 404, { error: "Team not found." });
  if (nextTeam.locked || currentTeam?.locked) {
    return send(res, 400, { error: "Unlock teams before moving members." });
  }

  const nextRole = nextTeam.members.length === 0 ? "LEAD" : "MEMBER";
  await prisma.$transaction(async (tx) => {
    await tx.teamMember.deleteMany({ where: { userId: target.id } });
    await tx.teamMember.create({
      data: {
        teamId: nextTeam.id,
        userId: target.id,
        role: nextRole,
      },
    });
    if (nextRole === "LEAD") {
      await tx.teamResponsibility.updateMany({
        where: { teamId: nextTeam.id, label: "Project Lead" },
        data: { userId: target.id },
      });
    }
  });

  send(res, 200, {
    ok: true,
    id: target.id,
    teamId: nextTeam.id,
    team: nextTeam.name,
    teamRole: nextRole,
  });
}

async function handleAdminDeleteParticipant(req, res, participantId) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN") return send(res, 403, { error: "Admins only." });

  const id = String(participantId || "").trim();
  if (!id) return send(res, 400, { error: "Participant id is required." });

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role !== "PARTICIPANT") {
    return send(res, 404, { error: "Participant not found." });
  }

  await prisma.$transaction(async (tx) => {
    await tx.teamMember.deleteMany({ where: { userId: target.id } });
    await tx.teamResponsibility.updateMany({
      where: { userId: target.id },
      data: { userId: null },
    });
    await tx.task.updateMany({
      where: { assigneeId: target.id },
      data: { assigneeId: null },
    });
    await tx.notification.deleteMany({ where: { userId: target.id } });
    await tx.taskComment.deleteMany({ where: { authorId: target.id } });
    await tx.chatMessage.deleteMany({ where: { authorId: target.id } });
    await tx.submission.updateMany({
      where: { authorId: target.id },
      data: { authorId: null },
    });
    await tx.workspaceDoc.updateMany({
      where: { updatedById: target.id },
      data: { updatedById: null },
    });
    await tx.score.deleteMany({ where: { judgeId: target.id } });
    await tx.user.delete({ where: { id: target.id } });
  });

  send(res, 200, { ok: true, id: target.id });
}

async function handleAdminSetParticipantRole(req, res, participantId, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN") return send(res, 403, { error: "Admins only." });

  const id = String(participantId || "").trim();
  if (!id) return send(res, 400, { error: "Participant id is required." });

  const requested = String(body.role || "").trim().toUpperCase();
  const nextRole =
    requested === "LEAD" ? "LEAD" : requested === "MEMBER" ? "MEMBER" : null;
  if (!nextRole) {
    return send(res, 400, { error: "Role must be Project Lead or Member." });
  }

  const target = await prisma.user.findUnique({
    where: { id },
    include: { teamMemberships: { include: { team: true } } },
  });
  if (!target || target.role !== "PARTICIPANT") {
    return send(res, 404, { error: "Participant not found." });
  }

  const membership = target.teamMemberships[0];
  if (!membership) {
    return send(res, 400, {
      error: "Assign this participant to a team before changing their role.",
    });
  }

  if (membership.role === nextRole) {
    return send(res, 200, {
      ok: true,
      id: target.id,
      teamId: membership.teamId,
      team: membership.team.name,
      teamRole: nextRole,
      previousLead: null,
    });
  }

  let previousLead = null;
  await prisma.$transaction(async (tx) => {
    if (nextRole === "LEAD") {
      const currentLead = await tx.teamMember.findFirst({
        where: {
          teamId: membership.teamId,
          role: "LEAD",
          NOT: { userId: target.id },
        },
        include: { user: true },
      });
      if (currentLead) {
        previousLead = { id: currentLead.userId, name: currentLead.user.name };
        await tx.teamMember.update({
          where: { id: currentLead.id },
          data: { role: "MEMBER" },
        });
      }
    }

    await tx.teamMember.update({
      where: { id: membership.id },
      data: { role: nextRole },
    });

    const remainingLead = await tx.teamMember.findFirst({
      where: { teamId: membership.teamId, role: "LEAD" },
      select: { userId: true },
    });

    await tx.teamResponsibility.updateMany({
      where: { teamId: membership.teamId, label: "Project Lead" },
      data: { userId: remainingLead?.userId || null },
    });
  });

  send(res, 200, {
    ok: true,
    id: target.id,
    teamId: membership.teamId,
    team: membership.team.name,
    teamRole: nextRole,
    previousLead,
  });
}

function submissionFileLinks(s) {
  return [
    { key: "repo", label: "GitHub Repository", url: s.repoUrl },
    { key: "demo", label: "Live Demo", url: s.demoUrl },
    { key: "pitch", label: "Pitch Deck", url: s.deckUrl },
    { key: "slides", label: "Slides", url: s.slidesUrl },
    { key: "video", label: "Demo Video", url: s.videoUrl },
    { key: "docs", label: "Documentation", url: s.docsUrl },
    { key: "prototype", label: "Prototype", url: s.prototypeUrl },
    { key: "zip", label: "Project zip", url: s.zipUrl },
  ].filter((f) => Boolean(f.url));
}

function scoreBreakdown(sc) {
  if (!sc) return null;
  return {
    specific: sc.specific,
    measurable: sc.measurable,
    achievable: sc.achievable,
    relevant: sc.relevant,
    timeBound: sc.timeBound,
  };
}

async function handleAdminSubmissions(req, res) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN" && user.role !== "MENTOR" && user.role !== "JUDGE") {
    return send(res, 403, { error: "Mentors, judges, and admins only." });
  }

  let teamFilter = {};
  if (user.role === "MENTOR") {
    const teamIds = await getMentorAssignments(user.id);
    teamFilter = { teamId: { in: teamIds } };
  }

  // Hide never-submitted drafts; keep reopened projects (submittedAt set) visible
  const submissions = await prisma.submission.findMany({
    where: {
      ...teamFilter,
      OR: [{ status: { not: "DRAFT" } }, { submittedAt: { not: null } }],
    },
    include: {
      team: true,
      scores: {
        orderBy: { updatedAt: "desc" },
        include: {
          judge: { select: { id: true, name: true, role: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  send(res, 200, {
    canScore: user.role === "JUDGE",
    canReopen: user.role === "ADMIN",
    canPublishScores: user.role === "ADMIN",
    canViewJudgeScores: user.role === "ADMIN",
    canReview: true,
    submissions: submissions.map((s) => {
      const judgeScores = s.scores.filter((sc) => sc.judge?.role === "JUDGE");
      const myScore =
        user.role === "JUDGE"
          ? s.scores.find((sc) => sc.judgeId === user.id) || null
          : null;
      const scoresPublished =
        s.status === "FINAL" || Boolean(s.scoresPublishedAt);
      const average =
        judgeScores.length > 0
          ? Math.round(
              judgeScores.reduce((sum, sc) => sum + sc.total, 0) /
                judgeScores.length
            )
          : null;

      const reviews = judgeScores.map((sc) => ({
        judgeId: sc.judgeId,
        judgeName: sc.judge?.name || "Judge",
        notes: sc.notes,
        updatedAt: sc.updatedAt,
        completed: true,
        ...(scoresPublished
          ? {
              total: sc.total,
              breakdown: scoreBreakdown(sc),
            }
          : {}),
      }));

      const shared = {
        id: s.id,
        teamId: s.teamId,
        team: s.team.name,
        project: s.title,
        description: s.description,
        status: s.status,
        scoresPublished,
        scoresPublishedAt: s.scoresPublishedAt,
        timestamp: s.submittedAt || s.updatedAt,
        repo: s.repoUrl,
        demo: s.demoUrl,
        pitch: s.deckUrl,
        slides: s.slidesUrl,
        video: s.videoUrl,
        docs: s.docsUrl,
        prototype: s.prototypeUrl,
        zip: s.zipUrl,
        version: "v1",
        files: submissionFileLinks(s),
        judgeReviews: reviews,
      };

      if (user.role === "JUDGE") {
        return {
          ...shared,
          scoringCompleted: Boolean(myScore),
          score: myScore?.total ?? null,
          scoreNotes: myScore?.notes ?? null,
          breakdown: scoreBreakdown(myScore),
        };
      }

      if (user.role === "ADMIN") {
        return {
          ...shared,
          score: scoresPublished ? average : null,
          averagePending: !scoresPublished ? average : null,
          scoreNotes: null,
          breakdown: null,
          judgeCount: judgeScores.length,
          completedJudgeCount: judgeScores.length,
          canPublish: !scoresPublished && judgeScores.length > 0,
          judgeScores: judgeScores.map((sc) => ({
            judgeId: sc.judgeId,
            judgeName: sc.judge?.name || "Judge",
            total: sc.total,
            notes: sc.notes,
            breakdown: scoreBreakdown(sc),
            updatedAt: sc.updatedAt,
            completed: true,
          })),
        };
      }

      return {
        ...shared,
        score: scoresPublished ? average : null,
        scoreNotes: null,
        breakdown: null,
      };
    }),
  });
}

async function handleAdminUpdateSubmission(req, res, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN" && user.role !== "MENTOR" && user.role !== "JUDGE") {
    return send(res, 403, { error: "Mentors, judges, and admins only." });
  }

  const id = String(body.id || "");
  if (!id) return send(res, 400, { error: "Submission id required." });

  const existing = await prisma.submission.findUnique({
    where: { id },
    include: { team: true },
  });
  if (!existing) return send(res, 404, { error: "Submission not found." });

  if (user.role === "MENTOR") {
    const linked = await prisma.teamMentor.findFirst({
      where: { mentorId: user.id, teamId: existing.teamId },
    });
    const isPrimary = existing.team.mentorId === user.id;
    if (!linked && !isPrimary) {
      return send(res, 403, { error: "You are not assigned to this team." });
    }
  }

  let status = body.status ? String(body.status) : null;
  if (user.role === "JUDGE" && status === "FINAL") {
    status = "UNDER_REVIEW";
  }

  const publishScores = Boolean(body.publishScores);
  if (publishScores) {
    if (user.role !== "ADMIN") {
      return send(res, 403, {
        error: "Only administrators can publish judge scores.",
      });
    }
    const judgeScoreCount = await prisma.score.count({
      where: {
        submissionId: id,
        judge: { role: "JUDGE" },
      },
    });
    if (!judgeScoreCount) {
      return send(res, 400, {
        error: "Publish after at least one judge has completed grading.",
      });
    }
    status = "FINAL";
  }

  // Admins may reopen or mark in review; FINAL only via publishScores.
  if (user.role === "ADMIN" && status === "FINAL" && !publishScores) {
    return send(res, 400, {
      error: "Use Publish judge scores to release grades. Admins cannot set FINAL manually.",
    });
  }

  const allowed =
    user.role === "ADMIN"
      ? ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "FINAL"]
      : ["SUBMITTED", "UNDER_REVIEW"];
  if (status && !allowed.includes(status)) {
    return send(res, 400, {
      error:
        user.role === "ADMIN"
          ? "Invalid status."
          : user.role === "JUDGE"
            ? "Judges can score projects and mark them in review."
            : "Mentors can mark submissions in review. Judges score projects.",
    });
  }

  if (status === "DRAFT" && user.role === "ADMIN") {
    // Reopen clears published scores visibility
  }

  const wantsScore =
    (body.score != null && body.score !== "") ||
    body.specific != null ||
    body.measurable != null ||
    body.achievable != null ||
    body.relevant != null ||
    body.timeBound != null;
  let publishedScore = null;
  if (wantsScore) {
    if (user.role !== "JUDGE") {
      return send(res, 403, {
        error: "Only judges can score projects.",
      });
    }
    if (existing.status === "FINAL" || existing.scoresPublishedAt) {
      return send(res, 403, {
        error: "Scores are published. Ask an administrator to reopen if changes are needed.",
      });
    }

    const hasBreakdown =
      body.specific != null ||
      body.measurable != null ||
      body.achievable != null ||
      body.relevant != null ||
      body.timeBound != null;

    if (!hasBreakdown) {
      return send(res, 400, {
        error: "Score each SMART criterion (Specific, Measurable, Achievable, Relevant, Time-bound).",
      });
    }

    const clamp = (v, max) => {
      const n = Number(v);
      if (!Number.isFinite(n)) return 0;
      return Math.max(0, Math.min(max, Math.round(n)));
    };
    const specific = clamp(body.specific, 20);
    const measurable = clamp(body.measurable, 20);
    const achievable = clamp(body.achievable, 20);
    const relevant = clamp(body.relevant, 20);
    const timeBound = clamp(body.timeBound, 20);
    const rounded =
      specific + measurable + achievable + relevant + timeBound;

    publishedScore = rounded;
    if (!status && (existing.status === "SUBMITTED" || existing.status === "UNDER_REVIEW")) {
      status = "UNDER_REVIEW";
    }
    await prisma.score.upsert({
      where: {
        submissionId_judgeId: { submissionId: id, judgeId: user.id },
      },
      update: {
        total: rounded,
        specific,
        measurable,
        achievable,
        relevant,
        timeBound,
        notes: body.notes || null,
      },
      create: {
        submissionId: id,
        judgeId: user.id,
        total: rounded,
        specific,
        measurable,
        achievable,
        relevant,
        timeBound,
        notes: body.notes || null,
      },
    });
  }

  const updateData = {};
  if (status) updateData.status = status;
  if (publishScores) {
    updateData.scoresPublishedAt = new Date();
    updateData.status = "FINAL";
  }
  if (status === "DRAFT") {
    if (user.role !== "ADMIN") {
      return send(res, 403, {
        error: "Only administrators can reopen a project for revision.",
      });
    }
    updateData.scoresPublishedAt = null;
    updateData.status = "DRAFT";
  }

  const submission = await prisma.submission.update({
    where: { id },
    data: updateData,
    include: { team: true },
  });

  const notesText = String(body.notes || "").trim();
  const reopened = status === "DRAFT";
  const scoresJustPublished = publishScores;
  const judgeCompleted = Boolean(publishedScore != null);

  if (notesText || reopened || scoresJustPublished || judgeCompleted) {
    if (reopened && !notesText) {
      return send(res, 400, {
        error: "Add feedback so the team knows what to fix when reopening.",
      });
    }
    const members = await prisma.teamMember.findMany({
      where: { teamId: existing.teamId },
      select: { userId: true },
    });
    const mentorIds = new Set();
    const linkedMentors = await prisma.teamMentor.findMany({
      where: { teamId: existing.teamId },
      select: { mentorId: true },
    });
    for (const m of linkedMentors) mentorIds.add(m.mentorId);
    if (existing.team.mentorId) mentorIds.add(existing.team.mentorId);

    let title;
    let bodyText;
    let category = "mentor";
    let href = "/submit";
    if (reopened) {
      title = `Submission reopened: ${existing.title}`;
      bodyText = `Your project was reopened for updates. Feedback: ${notesText}`;
      category = "announcement";
    } else if (scoresJustPublished) {
      title = `Scores published: ${existing.title}`;
      bodyText =
        "Final scores from the judges are now available on the leaderboard and your submission page.";
      category = "leaderboard";
      href = "/leaderboard";
    } else if (judgeCompleted) {
      title = `Judge review: ${existing.title}`;
      bodyText = notesText
        ? `${user.name} completed grading and left feedback: ${notesText}`
        : `${user.name} completed grading. Scores stay private until administrators publish them.`;
      category = "mentor";
      href = "/submit";
    } else {
      title =
        user.role === "ADMIN"
          ? `Admin feedback on ${existing.title}`
          : user.role === "JUDGE"
            ? `Judge feedback from ${user.name}`
            : `Mentor feedback from ${user.name}`;
      bodyText = notesText;
    }

    const recipients = new Set(members.map((m) => m.userId));
    if (judgeCompleted || notesText) {
      for (const mentorId of mentorIds) recipients.add(mentorId);
    }

    for (const userId of recipients) {
      await notify(userId, {
        title,
        body: bodyText.slice(0, 220),
        category,
        href: mentorIds.has(userId) ? "/mentor/reviews" : href,
      });
    }
  }

  send(res, 200, { submission });
}

async function handleCreateTeam(req, res, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN") return send(res, 403, { error: "Admins only." });

  const name = String(body.name || "").trim();
  if (!name) return send(res, 400, { error: "Team name required." });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const anyLocked = await prisma.team.findFirst({
    where: { locked: true },
    select: { id: true },
  });

  const team = await prisma.team.create({
    data: {
      name,
      slug,
      description: body.description || null,
      locked: Boolean(anyLocked),
    },
  });

  send(res, 201, { team });
}

async function handleSetTeamsLocked(req, res, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN") return send(res, 403, { error: "Admins only." });

  const locked = Boolean(body.locked);
  const result = await prisma.team.updateMany({
    data: { locked },
  });

  send(res, 200, {
    locked,
    updated: result.count,
    message: locked
      ? "All teams are locked. Rosters can no longer change."
      : "All teams are unlocked. Rosters can be edited again.",
  });
}

async function handleDeleteTeam(req, res, teamId) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN") return send(res, 403, { error: "Admins only." });

  const id = String(teamId || "").trim();
  if (!id) return send(res, 400, { error: "Team id is required." });

  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) return send(res, 404, { error: "Team not found." });

  await prisma.team.delete({ where: { id: team.id } });
  send(res, 200, { ok: true, id: team.id });
}

async function handleSetTeamMembers(req, res, teamId, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN") return send(res, 403, { error: "Admins only." });

  const id = String(teamId || "").trim();
  if (!id) return send(res, 400, { error: "Team id is required." });

  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) return send(res, 404, { error: "Team not found." });
  if (team.locked) {
    return send(res, 400, { error: "This team is locked." });
  }

  const memberIds = Array.isArray(body.memberIds)
    ? [...new Set(body.memberIds.map(String).filter(Boolean))]
    : [];

  if (memberIds.length) {
    const participants = await prisma.user.findMany({
      where: { id: { in: memberIds }, role: "PARTICIPANT" },
      select: { id: true },
    });
    if (participants.length !== memberIds.length) {
      return send(res, 400, {
        error: "All members must be existing participant accounts.",
      });
    }
  }

  await prisma.$transaction(async (tx) => {
    if (memberIds.length) {
      await tx.teamMember.deleteMany({
        where: {
          userId: { in: memberIds },
          teamId: { not: id },
        },
      });
    }

    await tx.teamMember.deleteMany({ where: { teamId: id } });

    if (memberIds.length) {
      await tx.teamMember.createMany({
        data: memberIds.map((userId, index) => ({
          teamId: id,
          userId,
          role: index === 0 ? "LEAD" : "MEMBER",
        })),
      });
    }
  });

  const refreshed = await prisma.team.findUnique({
    where: { id },
    include: {
      members: { include: { user: true }, orderBy: { joinedAt: "asc" } },
      mentors: { include: { mentor: true } },
      mentor: true,
    },
  });

  send(res, 200, {
    team: {
      id: refreshed.id,
      name: refreshed.name,
      slug: refreshed.slug,
      locked: refreshed.locked,
      progress: refreshed.progress,
      members: refreshed.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        title: m.title || m.user.title,
        role: m.role,
      })),
      mentors: [
        ...(refreshed.mentor ? [refreshed.mentor.name] : []),
        ...refreshed.mentors.map((m) => m.mentor.name),
      ].filter((n, i, a) => a.indexOf(n) === i),
    },
  });
}

async function handleAssignMentors(req, res, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN") return send(res, 403, { error: "Admins only." });

  const mentorId = String(body.mentorId || "").trim();
  const teamIds = Array.isArray(body.teamIds)
    ? [...new Set(body.teamIds.map((id) => String(id).trim()).filter(Boolean))]
    : [];
  if (!mentorId) return send(res, 400, { error: "mentorId required." });

  const mentor = await prisma.user.findFirst({
    where: { id: mentorId, role: "MENTOR" },
    select: { id: true, name: true },
  });
  if (!mentor) return send(res, 404, { error: "Mentor account not found." });

  if (teamIds.length) {
    const teams = await prisma.team.findMany({
      where: { id: { in: teamIds } },
      select: { id: true },
    });
    if (teams.length !== teamIds.length) {
      return send(res, 400, { error: "One or more teams were not found." });
    }
  }

  await prisma.$transaction(async (tx) => {
    const previous = await tx.teamMentor.findMany({
      where: { mentorId },
      select: { teamId: true },
    });
    const previousIds = previous.map((p) => p.teamId);
    const removed = previousIds.filter((id) => !teamIds.includes(id));

    await tx.teamMentor.deleteMany({ where: { mentorId } });

    if (teamIds.length) {
      await tx.teamMentor.createMany({
        data: teamIds.map((teamId) => ({ teamId, mentorId })),
        skipDuplicates: true,
      });
      await tx.team.updateMany({
        where: { id: { in: teamIds } },
        data: { mentorId },
      });
    }

    if (removed.length) {
      await tx.team.updateMany({
        where: { id: { in: removed }, mentorId },
        data: { mentorId: null },
      });
    }
  });

  send(res, 200, {
    ok: true,
    mentorId,
    teamIds,
    mentorName: mentor.name,
  });
}

async function handleMentors(req, res) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });

  const mentors = await prisma.user.findMany({
    where: { role: "MENTOR" },
    include: { teamMentorships: { include: { team: true } } },
    orderBy: { name: "asc" },
  });

  send(res, 200, {
    mentors: mentors.map((m) => ({
      id: m.id,
      name: m.name,
      title: m.title,
      teams: m.teamMentorships.map((t) => t.team.name),
      teamIds: m.teamMentorships.map((t) => t.teamId),
    })),
  });
}

function brevoFailure(error, fallback) {
  console.error("Brevo send failed:", error.message, error.details || "");
  if (error.code === "BREVO_NOT_CONFIGURED") {
    return "Email service is not configured. Ask an organizer to set Brevo keys.";
  }
  if (
    error.code === "BREVO_UNAUTHORIZED" ||
    /unrecognised IP|authorized_ips|authorised_ips/i.test(error.message || "")
  ) {
    return "Brevo blocked this request: authorize your current IP in Brevo Security → Authorised IPs, then try again.";
  }
  return fallback;
}

async function handleAdminStaff(req, res) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN") return send(res, 403, { error: "Admins only." });

  const [invites, staff] = await Promise.all([
    prisma.invite.findMany({
      include: { invitedBy: { select: { id: true, name: true } } },
      orderBy: [{ acceptedAt: "asc" }, { createdAt: "desc" }],
    }),
    prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "JUDGE"] },
        emailVerifiedAt: { not: null },
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true,
        createdAt: true,
      },
    }),
  ]);

  send(res, 200, {
    invites: invites.map(publicInvite),
    admins: staff.filter((s) => s.role === "ADMIN"),
    judges: staff.filter((s) => s.role === "JUDGE"),
    meId: user.id,
  });
}

async function handleCreateInvite(req, res, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN") return send(res, 403, { error: "Admins only." });

  const email = String(body.email || "").trim().toLowerCase();
  const name = String(body.name || "").trim();
  const role = String(body.role || "").trim().toUpperCase();

  if (!email || !email.includes("@")) {
    return send(res, 400, { error: "Enter a valid email." });
  }
  if (role !== "ADMIN" && role !== "JUDGE") {
    return send(res, 400, { error: "Role must be ADMIN or JUDGE." });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser?.emailVerifiedAt) {
    if (existingUser.role === role) {
      return send(res, 409, {
        error: `That email already belongs to a ${role === "ADMIN" ? "administrator" : "judge"}.`,
      });
    }
    return send(res, 409, {
      error: "That email already has an account with a different role.",
    });
  }

  try {
    const invite = await issueInvite({
      email,
      name,
      role,
      invitedBy: user,
      req,
    });
    send(res, 201, {
      invite: publicInvite(invite),
      message: `Invitation sent to ${email}.`,
    });
  } catch (error) {
    send(res, 502, {
      error: brevoFailure(
        error,
        "Could not send the invitation email. Try again in a moment."
      ),
    });
  }
}

async function handleResendInvite(req, res, inviteId) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN") return send(res, 403, { error: "Admins only." });

  const existing = await prisma.invite.findUnique({ where: { id: inviteId } });
  if (!existing || existing.acceptedAt) {
    return send(res, 404, { error: "Pending invitation not found." });
  }

  try {
    const invite = await issueInvite({
      email: existing.email,
      name: existing.name,
      role: existing.role,
      invitedBy: user,
      req,
    });
    send(res, 200, {
      invite: publicInvite(invite),
      message: `Invitation resent to ${existing.email}.`,
    });
  } catch (error) {
    send(res, 502, {
      error: brevoFailure(
        error,
        "Could not resend the invitation email. Try again in a moment."
      ),
    });
  }
}

async function handleRevokeInvite(req, res, inviteId) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN") return send(res, 403, { error: "Admins only." });

  const existing = await prisma.invite.findUnique({ where: { id: inviteId } });
  if (!existing) {
    return send(res, 404, { error: "Invitation not found." });
  }

  await prisma.invite.delete({ where: { id: inviteId } });
  send(res, 200, { ok: true, id: inviteId });
}

async function handleAdminRevokeStaff(req, res, staffId) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN") return send(res, 403, { error: "Admins only." });

  const id = String(staffId || "").trim();
  if (!id) return send(res, 400, { error: "Staff id is required." });
  if (id === user.id) {
    return send(res, 400, { error: "You cannot revoke your own account." });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || (target.role !== "ADMIN" && target.role !== "JUDGE")) {
    return send(res, 404, { error: "Administrator or judge account not found." });
  }

  if (target.role === "ADMIN") {
    const otherAdmins = await prisma.user.count({
      where: {
        role: "ADMIN",
        emailVerifiedAt: { not: null },
        NOT: { id: target.id },
      },
    });
    if (otherAdmins < 1) {
      return send(res, 400, {
        error: "Cannot revoke the last administrator account.",
      });
    }
  }

  await prisma.user.delete({ where: { id: target.id } });
  send(res, 200, {
    ok: true,
    id: target.id,
    role: target.role,
    message:
      target.role === "ADMIN"
        ? "Administrator account revoked."
        : "Judge account revoked.",
  });
}

async function handleJudgeResources(req, res) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "JUDGE" && user.role !== "ADMIN") {
    return send(res, 403, { error: "Judges and admins only." });
  }

  const resources = await prisma.judgeResource.findMany({
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  send(res, 200, {
    canManage: user.role === "ADMIN",
    resources: resources.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      url: r.url,
      fileName: r.fileName,
      author: r.author?.name || "Admin",
      createdAt: r.createdAt,
    })),
  });
}

async function handleCreateJudgeResource(req, res, body) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN") return send(res, 403, { error: "Admins only." });

  const title = String(body.title || "").trim();
  const url = String(body.url || "").trim();
  const description = String(body.description || "").trim() || null;
  const fileName = String(body.fileName || "").trim() || null;
  if (!title || !url) {
    return send(res, 400, { error: "Title and file or link are required." });
  }

  const resource = await prisma.judgeResource.create({
    data: {
      title,
      description,
      url,
      fileName,
      authorId: user.id,
    },
  });

  const judges = await prisma.user.findMany({
    where: { role: "JUDGE", emailVerifiedAt: { not: null } },
    select: { id: true },
  });
  if (judges.length) {
    await prisma.notification.createMany({
      data: judges.map((j) => ({
        userId: j.id,
        title: `New judge resource: ${title}`,
        body: description
          ? description.slice(0, 160)
          : "Administrators shared a resource for judges.",
        category: "announcement",
        href: "/judge/resources",
      })),
    });
  }

  send(res, 201, {
    resource: {
      id: resource.id,
      title: resource.title,
      description: resource.description,
      url: resource.url,
      fileName: resource.fileName,
      createdAt: resource.createdAt,
    },
  });
}

async function handleDeleteJudgeResource(req, res, resourceId) {
  const user = await requireUser(req);
  if (!user) return send(res, 401, { error: "Sign in required." });
  if (user.role !== "ADMIN") return send(res, 403, { error: "Admins only." });

  const id = String(resourceId || "").trim();
  if (!id) return send(res, 400, { error: "Resource id required." });

  const existing = await prisma.judgeResource.findUnique({ where: { id } });
  if (!existing) return send(res, 404, { error: "Resource not found." });

  await prisma.judgeResource.delete({ where: { id } });
  send(res, 200, { ok: true, id });
}

/** Public mentor directory — profile fields only, no emails. */
async function handlePublicMentors(_req, res) {
  const mentors = await prisma.user.findMany({
    where: {
      role: "MENTOR",
      emailVerifiedAt: { not: null },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      title: true,
      bio: true,
      avatar: true,
    },
  });

  send(res, 200, {
    mentors: mentors.map((m) => ({
      id: m.id,
      name: m.name,
      title: m.title || "Programme Mentor",
      bio: m.bio || null,
      avatar: m.avatar || null,
    })),
  });
}

module.exports = {
  send,
  requireUser,
  publicUser,
  handleMe,
  handleOnboarding,
  handleProfile,
  handleDashboard,
  handleLeaderboard,
  handleSetLeaderboardScore,
  handleAnnouncements,
  handleCreateAnnouncement,
  handleNotifications,
  handleReadNotifications,
  handleClearNotifications,
  handleTeamsList,
  handleMyTeam,
  handleResponsibilities,
  handleSaveResponsibilities,
  handleTasks,
  handleCreateTask,
  handleMoveTask,
  handleTaskComments,
  handlePostTaskComment,
  handleUpload,
  handleAttachTaskFile,
  handleWorkspace,
  handleCreateWorkspaceSection,
  handleSaveWorkspace,
  handleChat,
  handlePostChat,
  handleReactChat,
  handleDeleteChat,
  handleForwardChat,
  handleSubmission,
  handleSaveSubmission,
  handleAdminOverview,
  handleAdminParticipants,
  handleAdminMoveParticipant,
  handleAdminSetParticipantRole,
  handleAdminDeleteParticipant,
  handleAdminDeleteMentor,
  handleAdminSubmissions,
  handleAdminUpdateSubmission,
  handleAdminStaff,
  handleCreateInvite,
  handleResendInvite,
  handleRevokeInvite,
  handleAdminRevokeStaff,
  handleJudgeResources,
  handleCreateJudgeResource,
  handleDeleteJudgeResource,
  handleCreateTeam,
  handleSetTeamsLocked,
  handleDeleteTeam,
  handleSetTeamMembers,
  handleAssignMentors,
  handleMentors,
  handlePublicMentors,
  EVENT,
};
