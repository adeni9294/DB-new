import DashboardClient from '@/components/DashboardClient' // Sesuaikan path lokasi DashboardClient kamu

export const dynamic = 'force-dynamic'

export default function Home() {
  // Langsung tampilkan dashboard untuk publik (Read-Only)
  return <DashboardClient />
}
