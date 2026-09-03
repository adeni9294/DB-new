import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/oracle/pool'

export const dynamic = 'force-dynamic'

async function parseVal(val: any): Promise<string> {
  if (val === null || val === undefined) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'number') return String(val)
  if (typeof val === 'object' && typeof val.read === 'function') {
    return new Promise((resolve) => {
      let data = ''
      val.setEncoding('utf8')
      val.on('data', (chunk: string) => { data += chunk })
      val.on('end', () => resolve(data))
      val.on('error', () => resolve(''))
    })
  }
  return String(val)
}

export async function GET() {
  try {
    const result: any = await executeQuery(`SELECT * FROM transactions`)
    const rows = result?.rows || (Array.isArray(result) ? result : [])

    let totalPemasukan = 0
    let totalPengeluaran = 0

    for (const row of rows) {
      let rawAmount: any = 0
      let rawType: any = ''

      if (Array.isArray(row)) {
        rawAmount = row[1] ?? row[2] ?? 0
        rawType = row[3] ?? row[4] ?? ''
      } else if (row && typeof row === 'object') {
        const keys = Object.keys(row)
        const amountKey = keys.find(k => /amount|nominal|jumlah|total/i.test(k))
        const typeKey = keys.find(k => /type|tipe|kategori|jenis/i.test(k))

        rawAmount = amountKey ? row[amountKey] : 0
        rawType = typeKey ? row[typeKey] : ''
      }

      const amountStr = await parseVal(rawAmount)
      const typeStr = (await parseVal(rawType)).toLowerCase()
      const amount = Number(amountStr) || 0

      const isExpense = ['pengeluaran', 'expense', 'out', 'keluar'].some(t => typeStr.includes(t))

      if (isExpense) {
        totalPengeluaran += amount
      } else {
        totalPemasukan += amount
      }
    }

    const totalSaldo = totalPemasukan - totalPengeluaran

    return NextResponse.json({
      userEmail: 'adeni9294@gmail.com',
      totalSaldo,
      pemasukanBulanIni: totalPemasukan,
      pengeluaranBulanIni: totalPengeluaran,
      sisaBudget: 3180000,
      pemasukanNote: 'Total Kas Masuk',
      pengeluaranNote: 'Total Kas Keluar',
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
    console.error('❌ Error API Summary:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data dari Oracle DB', details: error?.message },
      { status: 500 }
    )
  }
}
