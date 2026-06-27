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
          {/* Help Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => {
                window.open(
                  "https://gemini.google.com/gem/1J6y4-oQtd4GOTl-_CSCjJy32if5M1ew6?usp=sharing",
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
              className="flex h-10 items-center justify-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 text-red-700 shadow-sm transition hover:bg-red-100 cursor-pointer"
              aria-label="Open AccredX Assistant"
            >
              <Icon name="info" className="h-5 w-5" />
              <span className="text-sm font-bold tracking-wide">Help</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-max rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 pointer-events-none z-20">
              Need Help? Open AccredX Assistant
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
