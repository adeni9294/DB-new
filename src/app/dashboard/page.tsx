import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

type User = { id: number; email: string; name: string; }

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('user')

  // Kalau gak ada cookie langsung tendang ke login. Gak pake loading
  if (!userCookie) {
    redirect('/login')
  }

  let user: User
  try {
    user = JSON.parse(userCookie.value)
  } catch {
    redirect('/login')
  }
  
  // Lempar user ke Client Component
  return <DashboardClient user={user} />
}
