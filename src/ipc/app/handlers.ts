import { os } from "@orpc/server";
import { app } from "electron";
import { appService } from "@/database/services/app.service";

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
export const getLast12MonthsSales = os.handler(async () => {
  try {
    const list = await appService.getLast12MonthsSales();
    return list;
  } catch (error) {
    console.error("error", error);
  }
});
