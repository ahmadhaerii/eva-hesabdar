import {
  appVersion,
  currentPlatfom,
  getDashboardData,
  getDashboardStats,
  createCustomerStatement,
  getLast12MonthsSales,
} from "./handlers";

export const app = {
  getDashboardData,
  getDashboardStats,
  createCustomerStatement,
  getLast12MonthsSales,
  appVersion,
  currentPlatfom,
};
