import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('user')
  if (!userCookie) redirect('/login')
  const user = JSON.parse(decodeURIComponent(userCookie.value)) // tambah decodeURIComponent
  return <DashboardClient user={user} />
}
