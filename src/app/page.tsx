import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/dashboard') // langsung lempar ke dashboard
}
