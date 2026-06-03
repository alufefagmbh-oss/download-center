import nodemailer from 'nodemailer'

function createTransport() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) return null

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  })
}

export function parseEmails(raw: string): string[] {
  return raw
    .split(/[\n,;]/)
    .map((s) => s.trim())
    .filter((s) => s.includes('@'))
}

export async function sendOnboardingNotification(
  recipients: string[],
  data: {
    name: string
    firma: string
    position: string
    uid?: string
    telefon?: string
    email: string
  }
) {
  if (!recipients.length) return

  const transport = createTransport()
  if (!transport) return

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER

  const html = `
    <h2 style="font-family:sans-serif;margin-bottom:16px">Neuer Nutzer registriert</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td style="padding:4px 16px 4px 0;color:#666">Name</td><td style="padding:4px 0"><strong>${data.name}</strong></td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#666">E-Mail</td><td style="padding:4px 0">${data.email}</td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#666">Firma</td><td style="padding:4px 0">${data.firma}</td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#666">Position</td><td style="padding:4px 0">${data.position}</td></tr>
      ${data.telefon ? `<tr><td style="padding:4px 16px 4px 0;color:#666">Telefon</td><td style="padding:4px 0">${data.telefon}</td></tr>` : ''}
      ${data.uid ? `<tr><td style="padding:4px 16px 4px 0;color:#666">UID</td><td style="padding:4px 0">${data.uid}</td></tr>` : ''}
    </table>
  `

  const text = [
    'Neuer Nutzer registriert:',
    '',
    `Name:     ${data.name}`,
    `E-Mail:   ${data.email}`,
    `Firma:    ${data.firma}`,
    `Position: ${data.position}`,
    data.telefon ? `Telefon:  ${data.telefon}` : null,
    data.uid ? `UID:      ${data.uid}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  await transport.sendMail({
    from,
    to: recipients.join(', '),
    subject: `Neuer Nutzer: ${data.name} (${data.firma})`,
    text,
    html,
  })
}
