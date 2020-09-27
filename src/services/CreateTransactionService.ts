import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';
// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const balance = await transactionsRepository.getBalance();
    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Error');
    }

    const categoriesRepository = getRepository(Category);
    let categoryInDb = await categoriesRepository.findOne({
      where: { title: category },
    });
    if (!categoryInDb) {
      categoryInDb = categoriesRepository.create({ title: category });
      categoryInDb = await categoriesRepository.save(categoryInDb);
    }
    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id: categoryInDb.id,
    });
    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
