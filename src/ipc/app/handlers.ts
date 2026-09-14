import { os } from "@orpc/server";
import { app } from "electron";
import { appService } from "@/database/services/app.service";
import z from "zod";

export const currentPlatfom = os.handler(() => process.platform);

export const appVersion = os.handler(() => app.getVersion());

export const getDashboardData = os.handler(async () => {
  try {
    const list = await appService.getDashboardData();
    return list;
  } catch (error) {
    console.error("error", error);
  }
});
export const getDashboardStats = os.handler(async () => {
  try {
    const list = await appService.getDashboardStats();
    return list;
  } catch (error) {
    console.error("error", error);
  }
});
const idTypeInput = z.number();

export const createCustomerStatement = os
  .input(idTypeInput)
  .handler(async ({ input }) => {
    return appService.createCustomerStatement(input);
  });

export const getLast12MonthsSales = os.handler(async () => {
  try {
    const list = await appService.getLast12MonthsSales();
    return list;
  } catch (error) {
    console.error("error", error);
  }
});
