import { NextResponse } from 'next/server'
import { getConnection } from '@/lib/oracle/pool'

export async function GET() {
  let connection;
  try {
    connection = await getExecutionConnection()

    // 1. Hitung Total Pemasukan
    const incomeResult = await connection.execute(
      `SELECT NVL(SUM(amount), 0) AS TOTAL FROM transactions WHERE type = 'pemasukan'`
    )
    const totalPemasukan = (incomeResult.rows as any[])?.[0]?.TOTAL || 0

    // 2. Hitung Total Pengeluaran
    const expenseResult = await connection.execute(
      `SELECT NVL(SUM(amount), 0) AS TOTAL FROM transactions WHERE type = 'pengeluaran'`
    )
    const totalPengeluaran = (expenseResult.rows as any[])?.[0]?.TOTAL || 0

    // 3. Hitung Saldo Bersih
    const totalSaldo = totalPemasukan - totalPengeluaran

    // 4. Ambil Daftar Budget (opsional, jika ada tabel budgets)
    let budgets: any[] = []
    try {
      const budgetResult = await connection.execute(
        `SELECT id, category, percentage FROM budgets`
      )
      budgets = (budgetResult.rows as any[]).map(row => ({
        id: row.ID,
        category: row.CATEGORY,
        percentage: row.PERCENTAGE
      }))
    } catch (e) {
      // Fallback jika tabel budget belum dibuat
      budgets = [
        { id: 1, category: 'Makanan & Minuman', percentage: 70 },
        { id: 2, category: 'Transportasi', percentage: 45 },
        { id: 3, category: 'Operasional', percentage: 80 }
      ]
    }

    // 5. Ambil Agenda Hari Ini (opsional, jika ada tabel events)
    let agendaToday: any[] = []
    try {
      const eventResult = await connection.execute(
        `SELECT id, title, time FROM events WHERE TRUNC(event_date) = TRUNC(SYSDATE)`
      )
      agendaToday = (eventResult.rows as any[]).map(row => ({
        id: row.ID,
        title: row.TITLE,
        time: row.TIME
      }))
    } catch (e) {
      // Fallback jika tabel events belum ada
      agendaToday = []
    }

    return NextResponse.json({
      userEmail: 'adeni9294@gmail.com',
      totalSaldo,
      pemasukanBulanIni: totalPemasukan,
      pengeluaranBulanIni: totalPengeluaran,
      sisaBudget: 3180000,
      pemasukanNote: 'Total Kas Masuk',
      pengeluaranNote: 'Total Kas Keluar',
      saldoPercentageChange: '+0% dari bulan lalu',
      budgets,
      agendaToday
    })

  } catch (error: any) {
    console.error('Database Error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil ringkasan dashboard dari Oracle DB' },
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
