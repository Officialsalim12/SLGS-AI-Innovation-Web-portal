const PREFS_KEY = "ghs-notification-prefs";

// settings labels -> categories
export const NOTIFICATION_PREF_CATEGORIES: Record<string, string[]> = {
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

export function loadNotificationPrefs(): Record<string, boolean> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return null;
  }
}

export function saveNotificationPrefs(prefs: Record<string, boolean>) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

// categories still turned on
export function allowedNotificationCategories(
  prefs: Record<string, boolean> | null
): Set<string> | null {
  if (!prefs) return null;
  const enabled = Object.entries(prefs)
    .filter(([, on]) => on)
    .flatMap(([label]) => NOTIFICATION_PREF_CATEGORIES[label] || []);
  if (enabled.length === 0) return new Set();
  return new Set(enabled);
}
