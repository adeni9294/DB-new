import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/oracle/pool'

// Mencegah Next.js memanggil database saat proses build/prerender
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 1. Hitung Total Pemasukan
    const incomeResult: any = await executeQuery(
      `SELECT NVL(SUM(amount), 0) AS TOTAL FROM transactions WHERE LOWER(type) IN ('pemasukan', 'income')`
    )
    const totalPemasukan = Number(incomeResult?.rows?.[0]?.TOTAL || 0)

    // 2. Hitung Total Pengeluaran
    const expenseResult: any = await executeQuery(
      `SELECT NVL(SUM(amount), 0) AS TOTAL FROM transactions WHERE LOWER(type) IN ('pengeluaran', 'expense')`
    )
    const totalPengeluaran = Number(expenseResult?.rows?.[0]?.TOTAL || 0)

    // 3. Hitung Total Saldo
    const totalSaldo = totalPemasukan - totalPengeluaran

    return NextResponse.json({
      userEmail: 'adeni9294@gmail.com',
      totalSaldo,
      pemasukanBulanIni: totalPemasukan,
      pengeluaranBulanIni: totalPengeluaran,
      sisaBudget: 3180000,
      pemasukanNote: 'Total Kas Masuk (Oracle DB)',
      pengeluaranNote: 'Total Kas Keluar (Oracle DB)',
      saldoPercentageChange: '+0% dari bulan lalu',
      budgets: [
        { id: 1, category: 'Makanan & Minuman', percentage: 70 },
        { id: 2, category: 'Transportasi', percentage: 45 },
        { id: 3, category: 'Kas Organisasi K&B', percentage: 82 },
        { id: 4, category: 'Acara Seminar Kit', percentage: 104 }
      ],
      agendaToday: [
        { id: 1, title: 'Rapat Koordinasi', time: '10:00 - 11:30' },
        { id: 2, title: 'Penutupan Donasi', time: 'Sampai 17 Sep 2026' }
      ]
    })
  } catch (error: any) {
    console.error('Database Error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data ringkasan dari Oracle DB' },
      { status: 500 }
    )
  }
}
