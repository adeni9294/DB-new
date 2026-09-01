import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient' // komponen UI kamu

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('user')
  
  if (!userCookie) {
    redirect('/login') // kalau gak ada cookie, tendang ke login
  }

  const user = JSON.parse(decodeURIComponent(userCookie.value))
  
  return <DashboardClient user={user} /> // lempar ke client component
}
