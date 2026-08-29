export interface TransactionReportRow {
  date: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  actor: string;
}

/**
 * Memformat array data transaksi menjadi format CSV (siap diunduh sebagai file Excel)
 */
export function generateCSVReport(data: TransactionReportRow[]): string {
  const headers = ['Tanggal', 'Kategori', 'Tipe', 'Jumlah (IDR)', 'Keterangan', 'Penanggung Jawab'];
  
  const rows = data.map((item) => [
    `"${item.date}"`,
    `"${item.category}"`,
    `"${item.type}"`,
    item.amount,
    `"${item.description.replace(/"/g, '""')}"`,
    `"${item.actor}"`,
  ]);

  return [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
}

/**
 * Memicu pengunduhan file CSV di sisi client
 */
export function downloadFile(content: string, fileName: string, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
