import Image from 'next/image'

export function Footer() {
  return (
    <footer className="mt-auto bg-[#ececec] border-t border-[#d8d8d8]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">

          {/* Logo */}
          <div className="flex flex-col gap-2">
            <div className="relative h-10 w-44">
              <Image
                src="/images/Downloads.png"
                alt="ALUFEFA"
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-brand-gray">
              Downloadcenter
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2.5">
            <p className="text-[0.65rem] font-bold tracking-widest uppercase text-brand-gray/60 mb-1">
              Unsere Webseiten
            </p>
            <a
              href="https://www.alufefa.at"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-brand-gray hover:text-brand-dark-gray transition-colors"
            >
              www.alufefa.at
            </a>
            <a
              href="https://shop.alufefa.at"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-brand-gray hover:text-brand-dark-gray transition-colors"
            >
              shop.alufefa.at
            </a>
          </div>

          {/* Rechtliches */}
          <div className="flex flex-col gap-2.5">
            <p className="text-[0.65rem] font-bold tracking-widest uppercase text-brand-gray/60 mb-1">
              Rechtliches
            </p>
            <a
              href="https://www.alufefa.at/agbs/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-brand-gray hover:text-brand-dark-gray transition-colors"
            >
              AGBs
            </a>
            <a
              href="https://www.alufefa.at/impressum/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-brand-gray hover:text-brand-dark-gray transition-colors"
            >
              Impressum
            </a>
            <a
              href="https://www.alufefa.at/datenschutz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-brand-gray hover:text-brand-dark-gray transition-colors"
            >
              Datenschutz
            </a>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-[#d0d0d0]">
          <p className="text-xs text-brand-gray/60">
            &copy; {new Date().getFullYear()} ALUFEFA GmbH. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  )
}
