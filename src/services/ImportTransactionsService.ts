import csvtojson from 'csvtojson';
import fs from 'fs';
import path from 'path';

import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  csvFilename: string;
}

class ImportTransactionsService {
  async execute({ csvFilename }: Request): Promise<Transaction[]> {
    const csvFilePath = path.join(uploadConfig.directory, csvFilename);
    const importedTransactions = await csvtojson().fromFile(csvFilePath);

    const transactions: Transaction[] = [];

    const createTransactionService = new CreateTransactionService();

    for (const importedTransaction of importedTransactions) {
      const transaction = await createTransactionService.execute(
        importedTransaction,
      );

      transactions.push(transaction);
    }

    await fs.promises.unlink(csvFilePath);

    return transactions;
  }
}

export default ImportTransactionsService;
