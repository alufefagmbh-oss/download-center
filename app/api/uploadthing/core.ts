import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()

export const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async () => {
      return {}
    })
    .onUploadComplete(async ({ file }) => {
      const url = file.ufsUrl ?? file.url
      return { url }
    }),

  fileUploader: f({ blob: { maxFileSize: '64MB', maxFileCount: 1 } })
    .middleware(async () => {
      return {}
    })
    .onUploadComplete(async ({ file }) => {
      const url = file.ufsUrl ?? file.url
      return { url, name: file.name, size: file.size, type: file.type }
    }),
} satisfies FileRouter

export type AppFileRouter = typeof uploadRouter
