import { NextResponse } from 'next/server'
import { getConnection } from '@/lib/oracle/pool'

export async function GET() {
  let connection;
  try {
    connection = await getConnection()

    // 1. Hitung Total Pemasukan
    const incomeResult = await connection.execute(
      `SELECT NVL(SUM(amount), 0) AS TOTAL FROM transactions WHERE LOWER(type) IN ('pemasukan', 'income')`
    )
    const totalPemasukan = Number((incomeResult.rows as any[])?.[0]?.TOTAL || 0)

    // 2. Hitung Total Pengeluaran
    const expenseResult = await connection.execute(
      `SELECT NVL(SUM(amount), 0) AS TOTAL FROM transactions WHERE LOWER(type) IN ('pengeluaran', 'expense')`
    )
    const totalPengeluaran = Number((expenseResult.rows as any[])?.[0]?.TOTAL || 0)

    // 3. Hitung Saldo
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
      { error: 'Gagal mengambil data dari Oracle DB' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      try {
        await connection.close()
      } catch (err) {
        console.error(err)
      }
    }
  }
}
