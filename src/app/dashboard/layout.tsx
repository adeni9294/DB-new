import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardShell from './DashboardShell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const userCookie = cookieStore.get('user')

  if (!userCookie) {
    // jika cookie tidak ada, redirect ke login
    redirect('/login')
  }

  let user: any
  try {
    user = JSON.parse(userCookie!.value)
  } catch (e) {
    // cookie rusak -> hapus dan redirect
    try { cookieStore.delete('user') } catch (err) { /* ignore */ }
    redirect('/login')
  }

  const safeUser = {
    id: user.id,
    email: user.email,
    fullName: user.name || (user.email ? String(user.email).split('@')[0] : 'User'),
    role: user.role || undefined,
  }

  return <DashboardShell user={safeUser}>{children}</DashboardShell>
}
