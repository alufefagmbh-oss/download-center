import { redirect } from 'next/navigation'
import { auth, currentUser } from '@clerk/nextjs/server'
import { AdminSidebar } from '@/components/admin/sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const isAdmin = (user?.publicMetadata as { role?: string })?.role === 'admin'
  if (!isAdmin) redirect('/')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}
