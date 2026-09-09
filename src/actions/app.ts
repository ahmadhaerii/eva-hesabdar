import { ipc } from "@/ipc/manager";

export function getPlatform() {
  return ipc.client.app.currentPlatfom();
}

export function getAppVersion() {
  return ipc.client.app.appVersion();
}

export async function getDashboardData(): Promise<
  Awaited<ReturnType<typeof ipc.client.app.getDashboardData>>
> {
  return ipc.client.app.getDashboardData();
}
export async function getLast12MonthsSales(): Promise<
  Awaited<ReturnType<typeof ipc.client.app.getLast12MonthsSales>>
> {
  return ipc.client.app.getLast12MonthsSales();
}
