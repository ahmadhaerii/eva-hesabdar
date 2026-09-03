import { currencyRepository } from "../repositories/currency/currency.repository";
import { NewCurrency, NewCurrencyRate } from "../types/database";

export class CurrencyService {
  async listCurrencies() {
    const list = await currencyRepository.listCurrencies();
    return list;
  }
  async createCurrency(data: NewCurrency) {
    return currencyRepository.createCurrency(data);
  }

  async updateCurrency(id: number, data: Partial<NewCurrency>) {
    return currencyRepository.updateCurrency(id, data);
  }

  async deleteCurrency(id: number) {
    return currencyRepository.deleteCurrency(id);
  }

  // CurrencyRates

  async listCurrencyRates() {
    return currencyRepository.listCurrencyRates();
  }
  async getRatesByCurrency(data: { id: number }) {
    return currencyRepository.getRatesByCurrency(data.id);
  }

  async createCurrencyRate(data: NewCurrencyRate) {
    return currencyRepository.createCurrencyRate(data);
  }
}

export const currencyService = new CurrencyService();
