import Icon from "@/components/Icon";
import type { UserProfile } from "@/components/LoginScreen";

export type ViewId =
  | "dashboard"
  | "add-activity"
  | "my-activities"
  | "reports"
  | "profile"
  | "timeline"
  | "course-activity-hub";

type SidebarProps = {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
  user: UserProfile;
  onLogout: () => void;
};

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "grid", color: "text-sky-600 bg-sky-50" },
  { id: "add-activity", label: "Add Activity", icon: "plus", color: "text-red-600 bg-red-50" },
  { id: "my-activities", label: "My Activities", icon: "clipboard", color: "text-emerald-600 bg-emerald-50" },
  { id: "reports", label: "Reports", icon: "chart", color: "text-violet-600 bg-violet-50" },
  { id: "profile", label: "Profile", icon: "user", color: "text-amber-600 bg-amber-50" },
  { id: "timeline", label: "Timeline", icon: "history", color: "text-indigo-600 bg-indigo-50" },
  { id: "course-activity-hub", label: "Course Activity Hub", icon: "book", color: "text-rose-650 bg-rose-50" },
] as const;

export default function Sidebar({ activeView, onNavigate, user, onLogout }: SidebarProps) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-red-100 bg-white/95 px-5 py-6 shadow-[8px_0_30px_rgba(185,28,28,0.04)] lg:flex lg:flex-col print:hidden">
      <div className="mb-8 flex items-center gap-3 rounded-2xl border border-red-100 bg-gradient-to-br from-white to-red-50 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-200">
          <Icon name="shield" className="h-6 w-6" />
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tight text-red-700">
            AccredX
          </h1>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
            Faculty Portal
          </p>
        </div>
      </div>

      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = item.id === activeView;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition ${
                isActive
                  ? "bg-red-600 text-white shadow-lg shadow-red-100"
                  : "text-gray-700 hover:bg-red-50 hover:text-red-700"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  isActive ? "bg-white/15 text-white" : item.color
                }`}
              >
                <Icon name={item.icon} className="h-4.5 w-4.5" />
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Faculty Profile & Compliance Status Widget */}
      <div className="mt-auto border-t border-red-100/60 pt-5 space-y-4">
        <div className="flex items-center gap-3 px-1.5 py-1">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 font-extrabold text-white shadow-md shadow-red-100">
            {initials}
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black tracking-tight text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-xs font-semibold text-gray-505 truncate">
              Department - {user.department || "—"}
            </p>
          </div>
        </div>

        {/* Accreditation Compliance Panel */}
        <div className="rounded-xl border border-red-50 bg-gradient-to-br from-red-50/40 to-rose-50/20 p-3">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-red-700">
            <Icon name="education" className="h-3.5 w-3.5 text-red-600" />
            NBA & NAAC Compliant
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
            <Icon name="lock" className="h-3 w-3 shrink-0 text-gray-300" />
            Repository Encrypted
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-between rounded-xl border border-red-100 bg-red-50/10 px-3.5 py-2.5 text-left text-sm font-bold text-red-650 transition hover:bg-red-50 hover:text-red-700"
        >
          <span className="flex items-center gap-2">
            <Icon name="lock" className="h-4 w-4" />
            Log Out
          </span>
          <span className="text-[9px] font-black uppercase tracking-wider text-red-400">Exit</span>
        </button>
      </div>
    </aside>
  );
}
