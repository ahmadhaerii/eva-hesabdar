import { getCurrencies } from "@/actions/currency";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Currency {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  code: string;
  isBase: boolean;
}

interface CurrencyState {
  defaultCurrency: Currency | null;
  setDefaultCurrency: (currencies: Currency[]) => void;
  fetchCurrency: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      defaultCurrency: null,
      setDefaultCurrency: (currencies: Currency[]) => {
        const defaultCurrency =
          currencies.find((c) => c.isBase) || currencies[0] || null;
        set({
          defaultCurrency: defaultCurrency || null,
        });
      },
      fetchCurrency: async () => {
        const { setDefaultCurrency } = get();

        try {
          const response: Currency[] | undefined = await getCurrencies();

          if (Array.isArray(response)) {
            setDefaultCurrency(response);
          }
        } catch (error) {
          console.error("Error fetching currencies:", error);
        }
      },
    }),
    {
      name: "currency-storage",
      partialize: (state) => ({
        defaultCurrency: state.defaultCurrency,
      }),
    },
  ),
);
