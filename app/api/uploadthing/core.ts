import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { auth } from '@clerk/nextjs/server'

const f = createUploadthing()

export const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async () => {
      const { userId } = await auth()
      if (!userId) throw new Error('Nicht autorisiert')
      return { userId }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl }
    }),

  fileUploader: f({
    pdf: { maxFileSize: '64MB', maxFileCount: 1 },
    blob: { maxFileSize: '64MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      const { userId } = await auth()
      if (!userId) throw new Error('Nicht autorisiert')
      return { userId }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl, name: file.name, size: file.size, type: file.type }
    }),
} satisfies FileRouter

export type AppFileRouter = typeof uploadRouter
