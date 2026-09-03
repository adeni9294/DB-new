import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/oracle/pool'

export const dynamic = 'force-dynamic'

// Helper untuk membaca nilai angka dari rincian objek/array Oracle DB
function parseOracleAmount(rawRow: any): number {
  if (!rawRow) return 0
  
  let val: any
  if (Array.isArray(rawRow)) {
    val = rawRow[0]
  } else if (typeof rawRow === 'object') {
    val = rawRow.TOTAL ?? rawRow.total ?? Object.values(rawRow)[0]
  } else {
    val = rawRow
  }

  const num = Number(val)
  return isNaN(num) ? 0 : num
}

export async function GET() {
  try {
    // 1. Total Seluruh Pemasukan & Pengeluaran (Untuk Total Saldo)
    const totalIncomeRes: any = await executeQuery(
      `SELECT NVL(SUM(amount), 0) AS TOTAL FROM transactions WHERE LOWER(type) IN ('pemasukan', 'income', 'in')`
    )
    const totalExpenseRes: any = await executeQuery(
      `SELECT NVL(SUM(amount), 0) AS TOTAL FROM transactions WHERE LOWER(type) IN ('pengeluaran', 'expense', 'out')`
    )

    const grandTotalPemasukan = parseOracleAmount(totalIncomeRes?.rows?.[0])
    const grandTotalPengeluaran = parseOracleAmount(totalExpenseRes?.rows?.[0])
    const totalSaldo = grandTotalPemasukan - grandTotalPengeluaran

    // 2. Pemasukan & Pengeluaran Khusus Bulan Ini
    const monthIncomeRes: any = await executeQuery(
      `SELECT NVL(SUM(amount), 0) AS TOTAL FROM transactions 
       WHERE LOWER(type) IN ('pemasukan', 'income', 'in') 
       AND TO_CHAR(transaction_date, 'YYYY-MM') = TO_CHAR(SYSDATE, 'YYYY-MM')`
    )
    const monthExpenseRes: any = await executeQuery(
      `SELECT NVL(SUM(amount), 0) AS TOTAL FROM transactions 
       WHERE LOWER(type) IN ('pengeluaran', 'expense', 'out') 
       AND TO_CHAR(transaction_date, 'YYYY-MM') = TO_CHAR(SYSDATE, 'YYYY-MM')`
    )

    const pemasukanBulanIni = parseOracleAmount(monthIncomeRes?.rows?.[0])
    const pengeluaranBulanIni = parseOracleAmount(monthExpenseRes?.rows?.[0])

    return NextResponse.json({
      userEmail: 'adeni9294@gmail.com',
      totalSaldo,
      pemasukanBulanIni,
      pengeluaranBulanIni,
      sisaBudget: 3180000,
      pemasukanNote: 'Total Kas Masuk Bulan Ini',
      pengeluaranNote: 'Total Kas Keluar Bulan Ini',
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
    console.error('❌ Database Error di API Summary:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data ringkasan dari Oracle DB', details: error?.message },
      { status: 500 }
    )
  }
}
