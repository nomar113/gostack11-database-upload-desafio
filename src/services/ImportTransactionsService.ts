import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import CreateTransactionsService from './CreateTransactionService';

interface Request {
  csvFilename: string;
}

class ImportTransactionsService {
  async execute({ csvFilename }: Request): Promise<Transaction[]> {
    const csvFilePath = path.join(uploadConfig.directory, csvFilename);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: any[] = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const createTransactionService = new CreateTransactionsService();

    const transactions: Transaction[] = await Promise.all(
      lines.map(
        async (line: any): Promise<Transaction> => {
          const transaction = await createTransactionService.execute({
            title: line[0],
            type: line[1],
            value: line[2],
            category: line[3],
          });
          return transaction;
        },
      ),
    );

    return transactions;
  }
}

export default ImportTransactionsService;
