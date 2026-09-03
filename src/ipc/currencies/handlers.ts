import { currencyService } from "@/database/services/currency.service";
import { os } from "@orpc/server";
import { z } from "zod";

export const listCurrencies = os.handler(async () => {
  try {
    const list = await currencyService.listCurrencies();
    return list;
  } catch (error) {
    console.error("error", error);
  }
});

const createCurrencyInput = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  isBase: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
const updateCurrencyInput = z.object({
  id: z.number(),
  code: z.string().min(1),
  name: z.string().min(1),
  isBase: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const deleteCurrencyInput = z.object({
  id: z.number(),
});

const currencyInput = z.object({
  id: z.number(),
});

export const createCurrency = os
  .input(createCurrencyInput)
  .handler(async ({ input }) => {
    console.log("aaaa");

    return currencyService.createCurrency({
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      deletedAt: null,
    });
  });

export const updateCurrency = os
  .input(updateCurrencyInput)
  .handler(async ({ input }) => {
    const { id, ...data } = input;
    return currencyService.updateCurrency(id, data);
  });

export const deleteCurrency = os
  .input(deleteCurrencyInput)
  .handler(async ({ input }) => {
    return currencyService.deleteCurrency(input.id);
  });

// CurrencyRates

const createCurrencyRateInput = z.object({
  rate: z.number(),
  currencyId: z.number(),
});

export const listCurrencyRate = os.handler(async (input) => {
  return currencyService.listCurrencyRates();
});
export const getRatesByCurrency = os
  .input(currencyInput)
  .handler(async ({ input }) => {
    return currencyService.getRatesByCurrency(input);
  });

export const createCurrencyRate = os
  .input(createCurrencyRateInput)
  .handler(async ({ input }) => {
    return currencyService.createCurrencyRate({
      ...input,
      createdAt: new Date().toISOString(),
    });
  });
