export const dynamic = 'force-dynamic'; // PENTING: biar gak di build
export const revalidate = 0;

async function getTransactions() {
  // GANTI NEXT_PUBLIC_URL JADI APP_URL
  const res = await fetch(`${process.env.APP_URL}/api/transactions`, {
    cache: 'no-store', // biar gak di cache
  });

  if (!res.ok) {
    throw new Error('Gagal fetch data transaksi');
  }
  return res.json();
}

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Data Transaksi</h1>
      
      {transactions.length === 0 ? (
        <p>Belum ada transaksi</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ID</th>
              <th className="border p-2">Nominal</th>
              <th className="border p-2">Akun</th>
              <th className="border p-2">Tipe</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((trx: any) => (
              <tr key={trx.id}>
                <td className="border p-2">{trx.id}</td>
                <td className="border p-2">{trx.amount}</td>
                <td className="border p-2">{trx.accountId}</td>
                <td className="border p-2">{trx.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
