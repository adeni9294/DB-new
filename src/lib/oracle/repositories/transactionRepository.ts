import { executeQuery } from '../pool';

export interface TransactionData {
  id: number;
  title: string;
  amount: number;
  type: string;
  category: string;
  transactionDate: Date;
}

export async function updateTransaction(data: TransactionData) {
  // Query SQL UPDATE dengan penanganan format DATE Oracle yang aman
  const sql = `
    UPDATE TRANSACTIONS
    SET 
      TITLE = :title,
      AMOUNT = :amount,
      TYPE = :type,
      CATEGORY = :category,
      TRANSACTION_DATE = :transactionDate
    WHERE ID = :id
  `;

  const binds = {
    title: String(data.title),
    amount: Number(data.amount), // Memastikan tipe number
    type: String(data.type),
    category: String(data.category),
    transactionDate: data.transactionDate,
    id: Number(data.id) // Memastikan tipe number
  };

  const result = await executeQuery(sql, binds, { autoCommit: true });
  return result;
}

export async function deleteTransaction(id: number) {
  const sql = `DELETE FROM TRANSACTIONS WHERE ID = :id`;
  const binds = { id: Number(id) };

  return await executeQuery(sql, binds, { autoCommit: true });
}

export async function getTransactions(options: { limit: number; offset: number }) {
  const sql = `
    SELECT ID, TITLE, AMOUNT, TYPE, CATEGORY, TRANSACTION_DATE
    FROM TRANSACTIONS
    ORDER BY TRANSACTION_DATE DESC
    OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
  `;

  const binds = {
    offset: Number(options.offset),
    limit: Number(options.limit)
  };

  const result = await executeQuery(sql, binds);
  return result.rows;
}
