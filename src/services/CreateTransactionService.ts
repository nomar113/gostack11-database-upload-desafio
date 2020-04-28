import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);
    let category_id;

    const income = await transactionsRepository.getParcialBalance('income');
    const outcome = await transactionsRepository.getParcialBalance('outcome');
    const total = income - outcome;

    if (type === 'outcome' && total - value < 0) {
      throw new AppError('Outcome is greater than income.');
    }

    const existCategory = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });

    category_id = existCategory?.id;

    if (!existCategory) {
      const newCategory = categoriesRepository.create({ title: category });
      await categoriesRepository.save(newCategory);
      category_id = newCategory.id;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
