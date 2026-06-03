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

export async function sendOnboardingNotification(data: {
  name: string
  firma: string
  position: string
  uid?: string
  telefon?: string
  email: string
}) {
  const transport = createTransport()
  if (!transport) return

  const to = process.env.ONBOARDING_NOTIFY_EMAIL
  if (!to) return

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER

  await transport.sendMail({
    from,
    to,
    subject: `Neuer Nutzer registriert: ${data.name} (${data.firma})`,
    text: [
      `Ein neuer Nutzer hat das Onboarding abgeschlossen:`,
      ``,
      `Name:      ${data.name}`,
      `E-Mail:    ${data.email}`,
      `Firma:     ${data.firma}`,
      `Position:  ${data.position}`,
      data.telefon ? `Telefon:   ${data.telefon}` : null,
      data.uid ? `UID:       ${data.uid}` : null,
    ]
      .filter(Boolean)
      .join('\n'),
    html: `
      <h2>Neuer Nutzer registriert</h2>
      <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td style="padding:4px 0"><strong>${data.name}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">E-Mail</td><td style="padding:4px 0">${data.email}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Firma</td><td style="padding:4px 0">${data.firma}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Position</td><td style="padding:4px 0">${data.position}</td></tr>
        ${data.telefon ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Telefon</td><td style="padding:4px 0">${data.telefon}</td></tr>` : ''}
        ${data.uid ? `<tr><td style="padding:4px 12px 4px 0;color:#666">UID</td><td style="padding:4px 0">${data.uid}</td></tr>` : ''}
      </table>
    `,
  })
}
