export function Footer() {
  return (
    <footer className="mt-auto">

      {/* Blue section */}
      <div className="bg-brand-dark-blue text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">

            {/* Brand */}
            <div>
              <p className="text-xl font-bold tracking-[0.12em]">ALUFEFA</p>
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-white/50 mt-0.5">
                Downloadcenter
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-2.5">
              <p className="text-[0.65rem] font-bold tracking-widest uppercase text-white/30 mb-1">
                Unsere Webseiten
              </p>
              <a
                href="https://www.alufefa.at"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/70 hover:text-white transition-colors font-bold"
              >
                www.alufefa.at
              </a>
              <a
                href="https://shop.alufefa.at"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/70 hover:text-white transition-colors font-bold"
              >
                shop.alufefa.at
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* Gray section */}
      <div className="bg-[#3a3a3a]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-[#888]">
            &copy; {new Date().getFullYear()} ALUFEFA GmbH. Alle Rechte vorbehalten.
          </p>
          <p className="text-xs text-[#666]">
            Braunau am Inn, Österreich
          </p>
        </div>
      </div>

    </footer>
  )
}
