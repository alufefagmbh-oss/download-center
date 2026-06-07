# ALUFEFA Downloadcenter — Technische & Datenschutz-Dokumentation

> **Stand:** Juni 2026  
> **Erstellt für:** Übergabe an Auftragsfirma  
> **Vertraulichkeit:** Intern — nicht öffentlich zugänglich machen

---

## Inhaltsverzeichnis

1. [Projektübersicht](#1-projektübersicht)
2. [Technologiestack](#2-technologiestack)
3. [Systemarchitektur & Datenfluss](#3-systemarchitektur--datenfluss)
4. [Datenbankschema — Wo welche Daten liegen](#4-datenbankschema--wo-welche-daten-liegen)
5. [Externe Dienste & Datenspeicherorte](#5-externe-dienste--datenspeicherorte)
6. [Zugriffskontrolle & Authentifizierung](#6-zugriffskontrolle--authentifizierung)
7. [Umgebungsvariablen & Secrets](#7-umgebungsvariablen--secrets)
8. [API-Endpunkte](#8-api-endpunkte)
9. [Datensicherheit](#9-datensicherheit)
10. [DSGVO-Konformität](#10-dsgvo-konformität)
11. [Download-Tracking: Einwilligung erforderlich?](#11-download-tracking-einwilligung-erforderlich)
12. [Handlungsempfehlungen DSGVO](#12-handlungsempfehlungen-dsgvo)
13. [Übergabe-Checkliste für Auftragsfirma](#13-übergabe-checkliste-für-auftragsfirma)

---

## 1. Projektübersicht

Das ALUFEFA Downloadcenter ist ein **geschlossenes B2B-Portal** für registrierte Kunden und Partner. Nutzer können nach einer Registrierung und Freigabe technische Dokumente (Datenblätter, CAD-Dateien, Ausschreibungstexte, etc.) herunterladen. Alle Downloads werden protokolliert.

**Zugang:** Nur nach Registrierung und abgeschlossenem Onboarding  
**Zielgruppe:** Fachpartner, Kunden, Planer — keine Endverbraucher  
**Betreiber:** ALUFEFA GmbH

---

## 2. Technologiestack

| Schicht | Technologie | Version | Zweck |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Web-Applikation, SSR, Server Actions |
| Sprache | TypeScript | 5.x | Typsicherheit |
| Datenbank | Supabase (PostgreSQL) | — | Datenspeicherung, RLS |
| Authentifizierung | Clerk | 7.x | Nutzerregistrierung, Login, Rollen |
| Datei-Upload | UploadThing | — | Datei-Hosting (CDN) |
| E-Mail | Nodemailer (SMTP) | — | Admin-Benachrichtigungen |
| Drag & Drop | @dnd-kit | 6.x | Reihenfolge im Admin |
| Styling | TailwindCSS | 4.x | UI |
| Hosting | (Vercel empfohlen) | — | Deployment |

---

## 3. Systemarchitektur & Datenfluss

```
┌─────────────────────────────────────────────────────────────┐
│                      ALUFEFA Downloadcenter                  │
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────────┐  │
│  │  Nutzer  │───▶│  Clerk   │───▶│   Next.js App        │  │
│  │(Browser) │    │  (Auth)  │    │   (Server + Client)  │  │
│  └──────────┘    └──────────┘    └──────────┬───────────┘  │
│                                             │               │
│                              ┌──────────────┼──────────┐   │
│                              ▼              ▼          ▼   │
│                         ┌────────┐   ┌──────────┐  ┌─────┐ │
│                         │Supabase│   │UploadThing│  │SMTP │ │
│                         │  (DB) │   │  (Files) │  │(Mail│ │
│                         └────────┘   └──────────┘  └─────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Registrierungs- und Onboarding-Ablauf

```
1. Nutzer registriert sich (Clerk → /sign-up)
2. Weiterleitung zu /onboarding
3. Nutzer füllt Profil aus (Name, Firma, Position, Telefon)
4. Daten werden in Clerk-Metadaten gespeichert
5. Admin erhält E-Mail-Benachrichtigung
6. Nutzer hat Zugriff auf Downloads
```

### Download-Ablauf

```
1. Nutzer klickt "Download" auf einer Produktseite
2. Anfrage geht an /api/download/[id]
3. Server prüft Clerk-Authentifizierung (userId)
4. Download-Log wird in Supabase geschrieben (wer, was, wann)
5. Datei wird von UploadThing-CDN an den Nutzer gestreamt
```

---

## 4. Datenbankschema — Wo welche Daten liegen

Alle Tabellen befinden sich in **Supabase (PostgreSQL)**. Migrationen liegen unter `supabase/migrations/`.

### 4.1 Tabelle `manufacturers` — Hersteller

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID (PK) | Eindeutige ID |
| `name` | TEXT | Name des Herstellers |
| `slug` | TEXT (unique) | URL-freundlicher Name |
| `category` | TEXT | `alufefa` / `partner` / `sonstige` |
| `image_url` | TEXT | Bild-URL (UploadThing) |
| `created_at` | TIMESTAMPTZ | Erstellungsdatum |

**Zugriff:** Öffentlich lesbar (RLS: public SELECT)

---

### 4.2 Tabelle `product_types` — Produkte

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID (PK) | Eindeutige ID |
| `manufacturer_id` | UUID (FK) | → manufacturers.id |
| `name` | TEXT | Produktname |
| `slug` | TEXT | URL-Pfad |
| `image_url` | TEXT | Bild-URL (UploadThing) |
| `sort_order` | INTEGER | Reihenfolge |
| `created_at` | TIMESTAMPTZ | Erstellungsdatum |

**Zugriff:** Öffentlich lesbar (RLS: public SELECT)

---

### 4.3 Tabelle `download_sections` — Bereiche

Überschriften/Kategorien, die Gruppen zusammenfassen.

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID (PK) | Eindeutige ID |
| `product_type_id` | UUID (FK) | → product_types.id |
| `name` | TEXT | Bereichsname (z.B. "Technische Unterlagen") |
| `sort_order` | INTEGER | Reihenfolge |
| `created_at` | TIMESTAMPTZ | Erstellungsdatum |

**Zugriff:** Öffentlich lesbar (RLS: public SELECT)

---

### 4.4 Tabelle `download_groups` — Gruppen/Ordner

Eingeklappte Ordner innerhalb eines Bereichs oder direkt unter einem Produkt.

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID (PK) | Eindeutige ID |
| `product_type_id` | UUID (FK) | → product_types.id |
| `section_id` | UUID (FK, nullable) | → download_sections.id (null = kein Bereich) |
| `name` | TEXT | Gruppenname (z.B. "Datenblatt LG412") |
| `sort_order` | INTEGER | Reihenfolge |
| `created_at` | TIMESTAMPTZ | Erstellungsdatum |

**Zugriff:** Öffentlich lesbar (RLS: public SELECT)

---

### 4.5 Tabelle `downloads` — Dateien/Dokumente

Die eigentlichen Download-Einträge. Die Datei selbst liegt bei UploadThing.

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID (PK) | Eindeutige ID |
| `product_type_id` | UUID (FK) | → product_types.id |
| `group_id` | UUID (FK, nullable) | → download_groups.id |
| `section_id` | UUID (FK, nullable) | → download_sections.id (Direktdatei in Bereich) |
| `name` | TEXT | Angezeigter Dateiname |
| `file_url` | TEXT | UploadThing-URL der Datei |
| `original_filename` | TEXT | Originaler Dateiname beim Upload |
| `file_type` | TEXT | Dateityp (PDF, DXF, ZIP, …) |
| `file_size` | TEXT | Größe als lesbarer String (z.B. "2.4 MB") |
| `version` | TEXT | Version/Datum des Dokuments |
| `sort_order` | INTEGER | Reihenfolge |
| `created_at` | TIMESTAMPTZ | Erstellungsdatum |

> **Datei-Hierarchie:**  
> - `group_id` gesetzt → Datei in einer Gruppe  
> - `section_id` gesetzt, `group_id` null → Datei direkt in einem Bereich  
> - beides null → Allgemeine Datei (kein Ordner/Bereich)

**Zugriff:** Öffentlich lesbar (RLS: public SELECT) — **die eigentliche Datei** ist aber nur für eingeloggte Nutzer abrufbar (via `/api/download/[id]`)

---

### 4.6 Tabelle `download_logs` — Download-Protokoll ⚠️ Personenbezogen

**Dies ist die DSGVO-relevante Tabelle.** Jeder Download wird mit Nutzerdaten protokolliert.

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID (PK) | Eindeutige ID |
| `user_id` | TEXT | Clerk User-ID |
| `user_email` | TEXT | E-Mail des Nutzers |
| `user_name` | TEXT | Name des Nutzers |
| `user_company` | TEXT | Firma des Nutzers |
| `user_phone` | TEXT | Telefon des Nutzers |
| `user_position` | TEXT | Position/Funktion |
| `download_id` | UUID (FK, nullable) | → downloads.id |
| `download_name` | TEXT | Name der heruntergeladenen Datei |
| `manufacturer_name` | TEXT | Hersteller der Datei |
| `product_name` | TEXT | Produkt der Datei |
| `downloaded_at` | TIMESTAMPTZ | Zeitstempel des Downloads |

**Zugriff:** Kein öffentlicher Zugriff. Nur über Service-Role-Key (Server). RLS aktiv, keine öffentliche SELECT-Policy.

---

### 4.7 Tabelle `settings` — Systemeinstellungen

| Spalte | Typ | Beschreibung |
|---|---|---|
| `key` | TEXT (PK) | Einstellungsschlüssel |
| `value` | TEXT | Wert |
| `updated_at` | TIMESTAMPTZ | Letzte Änderung |

**Aktuelle Keys:** `notification_email` (E-Mail-Adressen für Onboarding-Benachrichtigungen)  
**Zugriff:** Nur Service-Role (Admin-Backend)

---

## 5. Externe Dienste & Datenspeicherorte

### 5.1 Clerk (Authentifizierung & Nutzerdaten)

**Was wird gespeichert:**
- E-Mail-Adresse, Name (Pflicht bei Registrierung)
- `publicMetadata`: `role` (admin/leer), `onboardingComplete` (true/false)
- `privateMetadata`: `name`, `firma`, `position`, `telefon`, `uid` (aus Onboarding)

**Datenspeicherort:** Clerk-Server (USA/EU je nach Plan-Konfiguration)  
**Zugriff:** Über Clerk Dashboard unter [dashboard.clerk.com](https://dashboard.clerk.com)  
**DSGVO:** Clerk ist als Auftragsverarbeiter über DPA abgesichert. EU-Serverregion wählbar.  
**Löschung:** Nutzer können im Clerk Dashboard vollständig gelöscht werden → alle Metadaten werden entfernt.

---

### 5.2 Supabase (Datenbank)

**Was wird gespeichert:** Alle Tabellen aus Abschnitt 4 (Hersteller, Produkte, Downloads, Logs)  
**Datenspeicherort:** Supabase-Hosted (AWS), Region wählbar — **EU (Frankfurt) empfohlen**  
**Zugriff:**  
- Supabase Dashboard: [app.supabase.com](https://app.supabase.com)
- SQL Editor, Table Editor, API-Dokumentation im Dashboard verfügbar
- Direkt via API mit `SUPABASE_SERVICE_ROLE_KEY` (nur serverseitig)

**RLS (Row Level Security):** Aktiv auf allen Tabellen. Schreiboperationen nur über Service-Role-Key, der ausschließlich serverseitig verwendet wird.

---

### 5.3 UploadThing (Datei-Hosting)

**Was wird gespeichert:** Hochgeladene Dateien (Datenblätter, CAD, ZIP, Bilder)  
**Datenspeicherort:** UploadThing CDN (AWS S3-basiert)  
**Zugriff:** UploadThing Dashboard unter [uploadthing.com](https://uploadthing.com)  
**Besonderheit:** Dateien sind über direkte CDN-URLs erreichbar, aber der Zugriff im Portal erfolgt immer über `/api/download/[id]` (mit Auth-Prüfung + Logging). Die Roh-URL ist technisch direkt aufrufbar — keine URL-Verschlüsselung.

> **⚠️ Hinweis:** UploadThing-URLs sind nicht geheim. Wer die URL kennt, kann direkt herunterladen (ohne Login). Das Portal-Logging deckt nur Downloads über das Portal ab. Für höchste Sicherheit: UploadThing gegen signierte/zeitlich begrenzte URLs konfigurieren oder auf eine eigene Speicherlösung wechseln.

---

### 5.4 SMTP-Mail (Admin-Benachrichtigungen)

**Was wird übertragen:** Name, E-Mail, Firma, Position, Telefon, UID eines neuen Nutzers  
**Wann:** Bei erfolgreichem Onboarding-Abschluss  
**Empfänger:** Admin-E-Mail-Adresse(n), konfiguriert in Supabase `settings.notification_email`  
**Konfiguration:** Via Umgebungsvariablen (`SMTP_HOST`, `SMTP_USER`, etc.)

---

## 6. Zugriffskontrolle & Authentifizierung

### Rollen

| Rolle | Beschreibung | Zugriff |
|---|---|---|
| Öffentlich | Nicht eingeloggt | Nur Hersteller-/Produkt-Übersicht, keine Downloads |
| Nutzer | Eingeloggt + Onboarding abgeschlossen | Downloads möglich, kein Admin |
| Admin | `publicMetadata.role === 'admin'` in Clerk | Vollzugriff auf Admin-Dashboard |

### Admin-Freischaltung

Admins werden **manuell** im Clerk Dashboard eingerichtet:
1. Clerk Dashboard → Users → Nutzer auswählen
2. `Public Metadata` bearbeiten: `{ "role": "admin" }`

### Route-Schutz

Alle Admin-Routen (`/admin/*`) prüfen serverseitig mit `requireAdmin()`:
```typescript
// lib/actions/[...].ts — Muster in allen Server Actions
async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const user = await currentUser()
  const isAdmin = user?.publicMetadata?.role === 'admin'
  if (!isAdmin) redirect('/')
}
```

Downloads (API-Route `/api/download/[id]`) prüfen Login, aber keine Admin-Rolle.

---

## 7. Umgebungsvariablen & Secrets

Alle Secrets liegen in `.env.local` (lokal) oder als verschlüsselte Umgebungsvariablen im Hosting (Vercel/etc.).

**`.env.local` — Vorlage für Übergabe:**

```bash
# ── Clerk (Authentifizierung) ──────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# ── Supabase (Datenbank) ──────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...       # Öffentlich — kein Secret
SUPABASE_SERVICE_ROLE_KEY=eyJ...           # ⚠️ Niemals im Client verwenden

# ── UploadThing (Datei-Hosting) ──────────────────────────────────
UPLOADTHING_TOKEN=eyJ...

# ── SMTP (E-Mail-Benachrichtigungen) ─────────────────────────────
SMTP_HOST=mail.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=downloads@alufefa.at
SMTP_PASS=...
SMTP_FROM=downloads@alufefa.at
```

> **Übergabe:** Die tatsächlichen Werte müssen separat und sicher übergeben werden (z.B. per Passwort-Manager, nicht per E-Mail im Klartext).

---

## 8. API-Endpunkte

| Methode | Pfad | Auth | Beschreibung |
|---|---|---|---|
| `GET` | `/api/download/[id]` | Eingeloggt | Datei herunterladen, Download wird geloggt |
| `GET` | `/api/download/[id]?download=1` | Eingeloggt | Wie oben, erzwingt Datei-Download (auch bei PDF) |
| `POST` | `/api/uploadthing` | Eingeloggt | Datei-Upload (UploadThing-Webhook) |
| `GET` | `/api/admin/logs-export` | Admin | CSV/Excel-Export der Download-Logs |
| `GET` | `/api/onboarding-done` | Eingeloggt | Setzt Onboarding-Cookie, leitet weiter |

Alle weiteren Datenzugriffe erfolgen über **Next.js Server Actions** (keine REST-API), direkt in den React-Komponenten.

---

## 9. Datensicherheit

### Datenbankebene (Supabase RLS)

Alle Tabellen haben Row Level Security (RLS) aktiv:

| Tabelle | Public SELECT | Public INSERT/UPDATE/DELETE | Service-Role |
|---|---|---|---|
| manufacturers | ✅ | ❌ | ✅ |
| product_types | ✅ | ❌ | ✅ |
| download_sections | ✅ | ❌ | ✅ |
| download_groups | ✅ | ❌ | ✅ |
| downloads | ✅ | ❌ | ✅ |
| download_logs | ❌ | ❌ | ✅ |
| settings | ❌ | ❌ | ✅ |

Der `SUPABASE_SERVICE_ROLE_KEY` umgeht RLS und ist ausschließlich serverseitig in Server Actions verwendet — er erscheint nie im Browser-Bundle.

### Applikationsebene

- **Alle Schreiboperationen** laufen über Server Actions mit vorangehender `requireAdmin()`-Prüfung
- **Download-Logs** sind nur über den Service-Role-Key erreichbar — kein öffentlicher Zugriff
- **Passwörter** werden von Clerk verwaltet — die Applikation speichert niemals Passwörter
- **Tokens und Secrets** sind ausschließlich in Umgebungsvariablen, nie im Code

### Transportebene

- Alle Verbindungen laufen über HTTPS (TLS)
- Clerk und Supabase erzwingen HTTPS
- UploadThing CDN liefert über HTTPS

### Bekannte Einschränkung

> UploadThing-Datei-URLs sind direkte CDN-Links ohne zeitliche Begrenzung. Wer die URL einer Datei kennt (z.B. aus Browser-History), kann sie ohne Login herunterladen. Das Download-Logging im Portal erfasst nur Zugriffe über `/api/download/[id]`. Für hochsensible Dokumente sollte auf signierte, zeitbegrenzte URLs umgestellt werden.

---

## 10. DSGVO-Konformität

### Personenbezogene Daten im System

| Datenkategorie | Wo gespeichert | Zweck | Rechtsgrundlage |
|---|---|---|---|
| E-Mail, Name | Clerk | Authentifizierung, Kommunikation | Art. 6(1)(b) DSGVO |
| Firma, Position, Telefon, UID | Clerk (`privateMetadata`) | Zugangsqualifikation, Audit | Art. 6(1)(b) DSGVO |
| Download-Logs (wer, was, wann) | Supabase `download_logs` | Nachverfolgung, Compliance | Art. 6(1)(b) DSGVO |
| Onboarding-Benachrichtigung | SMTP-E-Mail (transient) | Admin-Information | Art. 6(1)(b) DSGVO |

**Art. 6(1)(b) DSGVO** — *Vertragserfüllung*: Die Datenverarbeitung ist erforderlich zur Erfüllung des Nutzungsvertrages. Das Portal bietet einen geschützten Dokumentenzugang als Dienstleistung — Authentifizierung und Logging sind inhärenter Bestandteil dieser Dienstleistung.

### Auftragsverarbeiter

| Dienst | Rolle | DPA verfügbar |
|---|---|---|
| Clerk | Auftragsverarbeiter | Ja (Clerk DPA) |
| Supabase | Auftragsverarbeiter | Ja (Supabase DPA) |
| UploadThing | Auftragsverarbeiter | Prüfen — ggf. eigene Vereinbarung |
| SMTP-Anbieter | Auftragsverarbeiter | Vom Anbieter abhängig |

> **Maßnahme:** Mit allen Auftragsverarbeitern muss ein Auftragsverarbeitungsvertrag (AVV/DPA) abgeschlossen werden. Clerk und Supabase stellen diese bereit. Für UploadThing und den SMTP-Anbieter ist dies zu prüfen.

### Betroffenenrechte

Nutzer können folgende Rechte geltend machen (Art. 15–22 DSGVO):

| Recht | Wie umsetzbar |
|---|---|
| Auskunft | Clerk Dashboard: Nutzerdetails + Metadaten; Supabase: `download_logs` nach `user_id`/`user_email` filtern |
| Berichtigung | Clerk Dashboard: Metadaten bearbeiten |
| Löschung | 1. Nutzer in Clerk löschen 2. `download_logs` nach `user_id` löschen (manuell per SQL) |
| Einschränkung | Nutzer in Clerk deaktivieren (kein Login möglich) |
| Datenübertragbarkeit | Export: Admin → Logs → Excel-Export (enthält alle personenbezogenen Log-Daten) |

**SQL für vollständige Löschung eines Nutzers aus Logs:**
```sql
DELETE FROM download_logs WHERE user_id = '[clerk-user-id]';
-- Danach Nutzer im Clerk Dashboard löschen
```

### Speicherdauer

Es ist **keine automatische Löschung** von Download-Logs implementiert. Empfehlung:

- **Download-Logs:** Aufbewahrung maximal 3 Jahre (dann löschen) — oder nach individuellem Bedarf
- **Nutzerdaten in Clerk:** Solange Konto aktiv; bei Kündigung innerhalb von 30 Tagen löschen
- Automatische Löschung sollte als zukünftige Anforderung an die Auftragsfirma formuliert werden

### Datenschutzerklärung

Die Anwendung enthält **keine eingebettete Datenschutzerklärung**. Diese muss als separate Seite (`/datenschutz`) implementiert und verlinkt werden und folgendes abdecken:

- Welche Daten werden gesammelt (Registrierung, Download-Logs)
- Zweck und Rechtsgrundlage der Verarbeitung
- Auftragsverarbeiter (Clerk, Supabase, UploadThing, SMTP)
- Speicherdauer
- Betroffenenrechte und Kontaktadresse

---

## 11. Download-Tracking: Einwilligung erforderlich?

### Kurze Antwort

**Nein — ein separater Einwilligungsbutton vor jedem Download ist rechtlich nicht erforderlich**, wenn folgende Voraussetzungen erfüllt sind (siehe unten). Das Tracking kann auf **Art. 6(1)(b) DSGVO** (Vertragserfüllung) gestützt werden.

### Ausführliche Begründung

Das Download-Logging (Tabelle `download_logs`) protokolliert personenbezogene Daten (Name, E-Mail, Firma) in Verbindung mit Downloadaktivität.

**Warum keine Einwilligung (Art. 6(1)(a)) notwendig:**

1. **B2B-Kontext:** Das Portal richtet sich ausschließlich an Fachpartner und Kunden — nicht an Verbraucher. Im B2B-Bereich gelten erleichterte Bedingungen.

2. **Vertragsverhältnis:** Jeder Nutzer schließt durch die Registrierung einen Nutzungsvertrag ab. Das Tracking ist ein **inhärenter Bestandteil der Dienstleistung** (Zugriffsverwaltung, Compliance, Lizenznachverfolgung) — vergleichbar mit dem Logging in einem Firmen-Intranet.

3. **Keine Werbezwecke:** Die Daten werden ausschließlich für interne Nachverfolgungszwecke verwendet, nicht für Marketing oder Profilbildung.

4. **Verhältnismäßigkeit:** Die erhobenen Daten beschränken sich auf das für den Zweck Notwendige.

**Rechtsgrundlage: Art. 6(1)(b) DSGVO** — Die Verarbeitung ist erforderlich für die Erfüllung eines Vertrages, dessen Partei die betroffene Person ist.

Alternativ möglich: **Art. 6(1)(f) DSGVO** (Berechtigte Interessen) — das berechtigte Interesse von ALUFEFA, nachzuverfolgen, wer auf proprietäre technische Dokumente zugreift.

### Voraussetzungen damit kein Einwilligungsbutton nötig ist

- [ ] Datenschutzerklärung informiert klar über das Download-Tracking (Pflicht!)
- [ ] Nutzungsbedingungen bei Registrierung erwähnen das Logging
- [ ] Onboarding-Formular enthält einen Hinweis (z.B. "Durch die Nutzung des Portals werden Ihre Downloads zu Compliance-Zwecken protokolliert.")
- [ ] Daten werden nicht für andere Zwecke (Marketing etc.) verwendet
- [ ] Löschanfragen werden bearbeitet (Betroffenenrechte)

### Wenn doch ein Hinweis gewünscht ist

Falls aus Vorsicht oder Kundenwunsch ein Hinweis eingeblendet werden soll, reicht eine **einmalige Information beim ersten Login** (kein Opt-in-Button nötig):

```
ℹ️ Hinweis: Ihre Downloads werden zu Compliance- und Nachverfolgungszwecken 
protokolliert. Weitere Informationen in unserer Datenschutzerklärung.
[Zur Datenschutzerklärung]          [Verstanden]
```

Dies ist kein Einwilligungsdialog (kein "Ablehnen"-Button), sondern eine Informationspflicht nach Art. 13 DSGVO — und rechtlich sauberer als gar keine Hinweise.

> **⚠️ Rechtlicher Hinweis:** Diese Dokumentation ersetzt keine Rechtsberatung. Für finale DSGVO-Konformität empfehlen wir die Überprüfung durch einen auf Datenschutz spezialisierten Rechtsanwalt.

---

## 12. Handlungsempfehlungen DSGVO

### Sofort umzusetzen

1. **Datenschutzerklärung erstellen** und unter `/datenschutz` einbinden (Footer-Link)
2. **Auftragsverarbeitungsverträge** mit Clerk, Supabase, UploadThing und SMTP-Anbieter abschließen/prüfen
3. **Onboarding-Hinweis** zum Download-Tracking in das Onboarding-Formular einbauen
4. **Supabase-Region** auf EU (Frankfurt/eu-central-1) überprüfen/einstellen

### Mittelfristig (innerhalb 3 Monate)

5. **Automatische Log-Löschung** implementieren (z.B. Supabase Cron Job: Logs > 3 Jahre löschen)
6. **Nutzer-Löschprozess dokumentieren** (Schritt-für-Schritt für Admins)
7. **UploadThing signierte URLs** evaluieren (für höchste Dokumentensicherheit)

### Optional/Nice-to-have

8. **Einmaliger Onboarding-Hinweis** (Infobanner beim ersten Login) implementieren
9. **Download-Logs Export** für Nutzer (Auskunftspflicht nach Art. 15 DSGVO) vereinfachen

---

## 13. Übergabe-Checkliste für Auftragsfirma

### Zugänge (müssen übergeben werden)

- [ ] **Clerk Dashboard** — Einladung als Admin (Organisation: ALUFEFA)
- [ ] **Supabase Dashboard** — Projekt-Mitglied mit Admin-Rechten
- [ ] **UploadThing Dashboard** — Zugang zum Projekt
- [ ] **Hosting** (Vercel o.ä.) — Team-Mitglied
- [ ] **GitHub Repository** — Push-Zugriff auf `develop`-Branch
- [ ] **`.env.local`** — Alle aktuellen Secrets sicher übermitteln (Passwort-Manager)
- [ ] **SMTP-Zugangsdaten** — Separates Mail-Konto für Systembenachrichtigungen

### Technische Übergabe

- [ ] Lokale Entwicklungsumgebung aufgesetzt und getestet (`npm run dev`)
- [ ] Alle Datenbankmigrationen in Supabase ausgeführt (alle `.sql`-Dateien unter `supabase/migrations/`)
- [ ] Bestehende Produktions-Daten sind vorhanden und intakt
- [ ] Build-Pipeline (CI/CD) dokumentiert und funktionsfähig

### Wissenstransfer

- [ ] Diese Dokumentation übergeben
- [ ] Admin-Zugang demonstriert (Bereiche, Gruppen, Dateien erstellen)
- [ ] Download-Logs Export erklärt
- [ ] Nutzer-Verwaltung in Clerk erklärt (Admin-Rolle setzen, Nutzer löschen)
- [ ] DSGVO-Löschprozess erklärt

### Offene Punkte (für Auftragsfirma)

- [ ] Datenschutzerklärung als `/datenschutz`-Seite implementieren
- [ ] Onboarding-Hinweis auf Download-Tracking einbauen
- [ ] Automatische Löschung der Download-Logs nach X Jahren
- [ ] Impressum prüfen/erstellen
- [ ] UploadThing-AVV prüfen oder signierte URLs evaluieren

---

*Dieses Dokument wurde erstellt am 07.06.2026 und entspricht dem Projektstand zum selben Datum. Bei Änderungen am System ist die Dokumentation entsprechend zu aktualisieren.*
