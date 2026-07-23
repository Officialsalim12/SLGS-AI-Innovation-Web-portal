"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Trophy,
  Users,
  Upload,
  Settings,
  Columns3,
  NotebookPen,
  GraduationCap,
  UserRound,
  MessagesSquare,
  MoreHorizontal,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { clearSession, getStoredUser, type AuthRole } from "@/lib/auth";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

const participantNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/team", label: "My Team", icon: Users },
  { href: "/team-chat", label: "Team Chat", icon: MessagesSquare },
  { href: "/mentor-chat", label: "Mentor Chat", icon: MessageSquare },
  { href: "/workspace", label: "Workspace", icon: NotebookPen },
  { href: "/kanban", label: "Kanban Board", icon: Columns3 },
  { href: "/announcements", label: "Announcements", icon: Bell },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/submit", label: "Project Submission", icon: Upload },
];

const mentorNav: NavItem[] = [
  { href: "/mentor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mentor/reviews", label: "Project Reviews", icon: Upload },
  { href: "/mentor-chat", label: "Mentor Chat", icon: MessageSquare },
  { href: "/announcements", label: "Announcements", icon: Bell },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/participants", label: "Participants", icon: UserRound },
  { href: "/admin/teams", label: "Teams", icon: Users },
  { href: "/admin/mentors", label: "Assign Mentors", icon: GraduationCap },
  { href: "/admin/submissions", label: "Project Reviews", icon: Upload },
  { href: "/announcements", label: "Announcements", icon: Bell },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

const participantMobile: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/team", label: "Team", icon: Users },
  { href: "/team-chat", label: "Chat", icon: MessagesSquare },
  { href: "/kanban", label: "Board", icon: Columns3 },
];

function navForRole(role: AuthRole | null): NavItem[] {
  if (role === "ADMIN") return adminNav;
  if (role === "MENTOR") return mentorNav;
  if (role === "PARTICIPANT") return participantNav;
  return [];
}

function mobilePrimaryForRole(role: AuthRole | null): NavItem[] {
  if (role === "ADMIN") {
    return [
      { href: "/admin", label: "Home", icon: LayoutDashboard },
      { href: "/admin/teams", label: "Teams", icon: Users },
      { href: "/announcements", label: "News", icon: Bell },
      { href: "/admin/submissions", label: "Files", icon: Upload },
    ];
  }
  if (role === "MENTOR") {
    return [
      { href: "/mentor", label: "Home", icon: LayoutDashboard },
      { href: "/mentor/reviews", label: "Reviews", icon: Upload },
      { href: "/mentor-chat", label: "Chat", icon: MessageSquare },
      { href: "/announcements", label: "News", icon: Bell },
    ];
  }
  if (role === "PARTICIPANT") return participantMobile;
  return [];
}

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  pathname,
  dense = false,
}: {
  item: NavItem;
  pathname: string;
  dense?: boolean;
}) {
  const active = isNavActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-2xl text-sm font-medium transition-all duration-200",
        dense ? "px-3 py-3" : "px-3 py-2.5",
        active
          ? "portal-nav-active"
          : "text-fg-muted hover:bg-surface-muted hover:text-fg"
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition",
          active
            ? "bg-brand text-white dark:text-navy"
            : "bg-surface-muted text-fg-subtle group-hover:text-fg"
        )}
      >
        <item.icon className="h-4 w-4" strokeWidth={2.15} />
      </span>
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<AuthRole | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setDisplayName(user.name);
      setRole(user.role);
    }
  }, []);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = moreOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [moreOpen]);

  const nav = useMemo(() => navForRole(role), [role]);
  const mobilePrimary = useMemo(() => mobilePrimaryForRole(role), [role]);

  function signOut() {
    clearSession();
    router.push("/login");
  }

  return (
    <div className="portal-atmosphere flex min-h-dvh min-w-0 overflow-x-hidden bg-canvas text-fg">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[17rem] flex-col border-r border-line/80 bg-shell-elevated/80 shadow-[8px_0_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur-2xl lg:flex">
        <div className="flex h-[4.25rem] items-center border-b border-line/80 px-4">
          <BrandMark
            size={36}
            nameClassName="text-[12px] max-w-[11.5rem] leading-snug sm:text-[13px]"
          />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
          {nav.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>
        <div className="border-t border-line/80 p-4">
          <div className="rounded-2xl border border-line/70 bg-card/70 p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar name={displayName} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-fg">
                  {displayName || "Account"}
                </p>
                <p className="truncate text-xs text-fg-subtle">
                  {role === "ADMIN"
                    ? "Administrator"
                    : role === "MENTOR"
                      ? "Mentor"
                      : "Participant"}
                </p>
              </div>
            </div>
            <Link
              href="/settings"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface-muted/60 px-3 py-2 text-sm font-medium text-fg-muted transition hover:bg-surface-hover hover:text-fg"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface-muted/60 px-3 py-2 text-sm font-medium text-fg-muted transition hover:bg-surface-hover hover:text-fg"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 lg:pl-[17rem]">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-line/70 bg-canvas/75 px-3 backdrop-blur-2xl supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)] sm:px-4 lg:h-16 lg:px-8">
          <div className="min-w-0 lg:hidden">
            <p className="truncate text-sm font-semibold text-fg">
              {displayName || "Sierra Leone Grammar School"}
            </p>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1 rounded-2xl border border-line/70 bg-card/70 p-1 shadow-sm">
              <ThemeToggle />
              <NotificationBell />
              <Link
                href="/settings"
                aria-label="Settings"
                className="rounded-xl p-2 text-fg-muted hover:bg-surface-muted hover:text-fg lg:hidden"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="hidden rounded-xl p-2 text-fg-muted hover:bg-surface-muted hover:text-fg sm:inline-flex lg:hidden"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
            <Avatar name={displayName} size="sm" className="lg:hidden" />
          </div>
        </header>
        <div className="mx-auto w-full max-w-[1400px] p-3 pb-[calc(5.75rem+env(safe-area-inset-bottom))] sm:p-5 sm:pb-[calc(6rem+env(safe-area-inset-bottom))] lg:p-8 lg:pb-10">
          <div className="min-w-0 animate-in fade-in duration-300">
            {children}
          </div>
        </div>
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-line/80 bg-shell-elevated/90 pb-[env(safe-area-inset-bottom)] shadow-[0_18px_50px_-24px_rgba(15,23,42,0.45)] backdrop-blur-2xl lg:hidden">
        <div className="flex items-stretch justify-around px-1 py-1.5 sm:px-2">
          {mobilePrimary.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium sm:text-[11px]",
                  active ? "text-brand" : "text-fg-subtle"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl transition",
                    active ? "bg-brand/12 text-brand" : ""
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                </span>
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium sm:text-[11px]",
              moreOpen ? "text-brand" : "text-fg-subtle"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl",
                moreOpen ? "bg-brand/12" : ""
              )}
            >
              <MoreHorizontal className="h-5 w-5 shrink-0" />
            </span>
            <span>More</span>
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[1.75rem] border border-line bg-card pb-[env(safe-area-inset-bottom)] shadow-2xl">
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-fg-subtle/30" />
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-card/95 px-4 py-3 backdrop-blur">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-fg">
                  {displayName || "Navigation"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="rounded-xl p-2 text-fg-muted hover:bg-surface-muted hover:text-fg"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="grid gap-1.5 p-3 sm:grid-cols-2">
              {nav.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  dense
                />
              ))}
            </nav>
            <div className="border-t border-line p-3">
              <button
                type="button"
                onClick={signOut}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line px-3 py-3 text-sm font-medium text-fg-muted transition hover:bg-surface-muted hover:text-fg"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
