import { appRepository } from "../repositories/app/app.repository";
import { createCustomerStatementExcel } from "../repositories/report/report.repository";

export class AppService {
  async getDashboardData() {
    const list = await appRepository.getDashboardData();
    return list;
  }
  async createCustomerStatement(customerId: number) {
    const list =
      await createCustomerStatementExcel.createCustomerStatement(customerId);
    return list;
  }
  async getLast12MonthsSales() {
    const list = await appRepository.getLast12MonthsSales();
    return list;
  }
}

export const appService = new AppService();
