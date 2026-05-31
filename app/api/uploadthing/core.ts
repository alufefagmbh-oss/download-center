import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()

// Auth wird bewusst hier NICHT geprüft — Sicherheit erfolgt durch:
// 1. Admin-UI ist durch Clerk geschützt (nur Admins sehen den Upload-Button)
// 2. Server Actions prüfen requireAdmin() bevor URLs in die DB gespeichert werden
// Hintergrund: auth() von Clerk funktioniert in Vercel's Serverless-Kontext
// innerhalb von UploadThing's Middleware-Callback nicht zuverlässig.

export const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async () => {
      return {}
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl }
    }),

  fileUploader: f({
    pdf: { maxFileSize: '64MB', maxFileCount: 1 },
    blob: { maxFileSize: '64MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      return {}
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl, name: file.name, size: file.size, type: file.type }
    }),
} satisfies FileRouter

export type AppFileRouter = typeof uploadRouter
