import { appRepository } from "../repositories/app/app.repository";

export class AppService {
  async getDashboardData() {
    const list = await appRepository.getDashboardData();
    return list;
  }
  async getLast12MonthsSales() {
    const list = await appRepository.getLast12MonthsSales();
    return list;
  }
}

export const appService = new AppService();
