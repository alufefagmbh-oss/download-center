export function Footer() {
  return (
    <footer className="bg-brand-dark-blue text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

          {/* Brand */}
          <div>
            <p className="text-xl font-bold tracking-[0.12em]">ALUFEFA</p>
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-white/40 mt-0.5">
              Downloadcenter
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a
              href="https://www.alufefa.at"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/50 hover:text-white/80 transition-colors"
            >
              alufefa.at
            </a>
          </div>

        </div>

        {/* Divider + copyright */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} ALUFEFA GmbH. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  )
}
