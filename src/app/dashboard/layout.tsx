import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardShell from './DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('user')

  if (!userCookie) {
    redirect('/login')
  }

  let user: any
  try {
    user = JSON.parse(userCookie.value)
  } catch (e) {
    try { cookieStore.delete('user') } catch (err) { /* ignore */ }
    redirect('/login')
  }

  // Prioritaskan nama lengkap dari DB (full_name, fullName, atau name)
  const resolvedName = user.full_name || user.fullName || user.name

  const safeUser = {
    id: user.id,
    email: user.email,
    fullName: resolvedName && !resolvedName.includes('@')
      ? resolvedName
      : (user.email ? String(user.email).split('@')[0] : 'User'),
    role: user.role || undefined,
  }

  return <DashboardShell user={safeUser}>{children}</DashboardShell>
}
