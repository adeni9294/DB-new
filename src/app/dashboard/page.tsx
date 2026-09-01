import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('user')

  if (!userCookie) {
    redirect('/login')
  }

  let user
  try {
    user = JSON.parse(userCookie.value) // jangan decode
  } catch {
    cookieStore.delete('user') // cookie rusak, hapus
    redirect('/login')
  }

  // KUNCI: kasih default kalau name null dari Oracle
  const safeUser = {
    id: user.id,
    email: user.email,
    name: user.name || user.email.split('@')[0] // kalau null pake email
  }

  return <DashboardClient user={safeUser} />
}
