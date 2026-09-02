import { ipc } from "@/ipc/manager";

export async function getCurrencies(): Promise<
  Awaited<ReturnType<typeof ipc.client.currency.listCurrencies>>
> {
  return ipc.client.currency.listCurrencies();
}
export async function createCurrency(data: {
  code: string;
  name: string;
  isBase?: boolean;
  isActive?: boolean;
}): Promise<Awaited<ReturnType<typeof ipc.client.currency.createCurrency>>> {
  return ipc.client.currency.createCurrency(data);
}
export async function updateCurrency(
  id: number,
  data: {
    code: string;
    name: string;
    isBase?: boolean;
    isActive?: boolean;
  },
) {
  return ipc.client.currency.updateCurrency({
    id,
    ...data,
  });
}

export async function deleteCurrency(id: number) {
  return ipc.client.currency.deleteCurrency({
    id,
  });
}

export async function getCurrencyRates(): Promise<
  Awaited<ReturnType<typeof ipc.client.currency.listCurrencyRate>>
> {
  return ipc.client.currency.listCurrencyRate();
}
export async function createCurrencyRate(data: {
  rate: number;
  currencyId: number;
}): Promise<
  Awaited<ReturnType<typeof ipc.client.currency.createCurrencyRate>>
> {
  return ipc.client.currency.createCurrencyRate(data);
}
