'use client'
import { useState, useEffect } from 'react'
import { Info, X } from 'lucide-react'

const STORAGE_KEY = 'alufefa_tracking_notice_v1'

export function TrackingNoticeBanner({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) return
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [isLoggedIn])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="bg-brand-dark-blue/6 border-b border-brand-dark-blue/15">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-start gap-3">
        <Info size={15} className="text-brand-blue shrink-0 mt-0.5" />
        <p className="flex-1 text-xs text-brand-dark-gray leading-relaxed">
          <strong>Datenschutzhinweis:</strong> Ihre Downloads werden protokolliert (Zeitpunkt,
          Dateiname sowie Ihre bei der Registrierung angegebenen Kontaktdaten). Die ALUFEFA GmbH
          behält sich vor, Sie auf Basis dieser Daten telefonisch oder per E-Mail bezüglich
          heruntergeladener Produkte zu kontaktieren. Sie können dieser Kontaktaufnahme jederzeit
          ohne Angabe von Gründen widersprechen (Art.&nbsp;21 DSGVO) — bitte wenden Sie sich dazu
          an{' '}
          <a href="mailto:office@alufefa.at" className="text-brand-blue hover:underline font-medium">
            office@alufefa.at
          </a>
          . Rechtsgrundlage der Verarbeitung: Art.&nbsp;6(1)(f) DSGVO.
        </p>
        <button
          onClick={dismiss}
          aria-label="Hinweis schließen"
          className="text-brand-gray/60 hover:text-brand-dark-gray transition-colors shrink-0 mt-0.5"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
