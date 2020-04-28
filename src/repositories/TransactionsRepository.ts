import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  transactions: Transaction[];
  balance: {
    income: number;
    outcome: number;
    total: number;
  };
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getParcialBalance(type: 'income' | 'outcome'): Promise<number> {
    const transactions = await this.find();
    if (transactions.length > 0) {
      const sum = transactions
        .map(transaction => {
          return transaction.type === type ? transaction.value : 0;
        })
        .reduce((total, value) => total + value);
      return sum;
    }
    return 0;
  }

  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const income = await this.getParcialBalance('income');
    const outcome = await this.getParcialBalance('outcome');
    const total = income - outcome;
    const balance = {
      transactions,
      balance: {
        income,
        outcome,
        total,
      },
    };
    return balance;
  }
}

export default TransactionsRepository;
