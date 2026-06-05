import Icon from "@/components/Icon";

type HeaderProps = {
  subtitle: string;
  title: string;
};

export default function Header({ subtitle, title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-red-100 bg-white/90 px-5 py-4 backdrop-blur md:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 lg:hidden">
            <Icon name="shield" className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
              AccredX
            </p>
            <h1 className="text-2xl font-black tracking-tight text-gray-950">
              {title}
            </h1>
            <p className="mt-1 text-sm font-medium text-gray-500">{subtitle}</p>
          </div>
        </div>

        {/* Right side header actions */}
        <div className="hidden items-center gap-3 sm:flex">
          {/* Encryption Badge */}
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/50 px-3 py-1 text-emerald-800">
            <Icon name="lock" className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-black uppercase tracking-wider">SSL Secure</span>
          </div>

          {/* Quick Notification Button */}
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-250 bg-white text-gray-600 shadow-sm transition hover:bg-red-50 hover:text-red-600"
            aria-label="View notifications"
          >
            <Icon name="bell" className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </span>
          </button>

          {/* Quick Info Button */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-250 bg-white text-gray-600 shadow-sm transition hover:bg-red-50 hover:text-red-700"
            aria-label="Help Documentation"
          >
            <Icon name="info" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
