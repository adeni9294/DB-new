import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

type User = { id: number; email: string; name: string; }

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('user')

  if (!userCookie) {
    redirect('/login')
  }

  const user: User = JSON.parse(userCookie.value)
  
  return <DashboardClient user={user} />
}
