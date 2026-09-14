import {
  appVersion,
  currentPlatfom,
  getDashboardData,
  createCustomerStatement,
  getLast12MonthsSales,
} from "./handlers";

export const app = {
  getDashboardData,
  createCustomerStatement,
  getLast12MonthsSales,
  appVersion,
  currentPlatfom,
};
