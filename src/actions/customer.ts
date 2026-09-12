import { ipc } from "@/ipc/manager";

export async function getCustomers(): Promise<
  Awaited<ReturnType<typeof ipc.client.customer.listCustomers>>
> {
  return ipc.client.customer.listCustomers();
}
export async function listCustomersWithDebt(): Promise<
  Awaited<ReturnType<typeof ipc.client.customer.listCustomersWithDebt>>
> {
  return ipc.client.customer.listCustomersWithDebt();
}
export async function createCustomer(data: {
  customerTypeId: number;
  customProfitPercent?: number | null;
  displayName: string;
  nationalId?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  address?: string | null;
  postalCode?: string | null;
  description?: string | null;
  isActive?: boolean;
  isAnonymous?: boolean;
}): Promise<Awaited<ReturnType<typeof ipc.client.customer.createCustomer>>> {
  return ipc.client.customer.createCustomer(data);
}
export async function updateCustomer(
  id: number,
  data: {
    customerTypeId: number;
    customProfitPercent?: number | null;
    displayName: string;
    nationalId?: string | null;
    phone?: string | null;
    mobile?: string | null;
    email?: string | null;
    address?: string | null;
    postalCode?: string | null;
    description?: string | null;
    isActive?: boolean;
    isAnonymous?: boolean;
  },
) {
  return ipc.client.customer.updateCustomer({
    id,
    ...data,
  });
}

export async function deleteCustomer(id: number) {
  return ipc.client.customer.deleteCustomer({
    id,
  });
}

export async function getCustomerTypes(): Promise<
  Awaited<ReturnType<typeof ipc.client.customer.listCustomerType>>
> {
  return ipc.client.customer.listCustomerType();
}
export async function createCustomerType(data: {
  name: string;
  profitPercent: number;
  description?: string | null;
  isActive?: boolean;
}): Promise<
  Awaited<ReturnType<typeof ipc.client.customer.createCustomerType>>
> {
  return ipc.client.customer.createCustomerType(data);
}

export async function updateCustomerType(
  id: number,
  data: {
    name?: string;
    profitPercent: number;
    description?: string | null;
    isActive?: boolean;
  },
) {
  return ipc.client.customer.updateCustomerType({
    id,
    ...data,
  });
}

export async function deleteCustomerType(id: number) {
  return ipc.client.customer.deleteCustomerType({
    id,
  });
}

export async function getCustomerPayments(): Promise<
  Awaited<ReturnType<typeof ipc.client.customer.listCustomerPayment>>
> {
  return ipc.client.customer.listCustomerPayment();
}
export async function createCustomerPayment(data: {
  customerId: number;
  amount: number;
  currencyRateId: number;
  currencyRateAmount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string | null;
  description?: string | null;
}): Promise<
  Awaited<ReturnType<typeof ipc.client.customer.createCustomerPayment>>
> {
  console.log(data);
  return ipc.client.customer.createCustomerPayment(data);
}

export async function updateCustomerPayment(
  id: number,
  data: {
    customerId: number;
    amount: number;
    currencyRateAmount: number;
    paymentDate: string;
    currencyRateId: number;
    paymentMethod: string;
    referenceNumber?: string | null;
    description?: string | null;
  },
) {
  return ipc.client.customer.updateCustomerPayment({
    id,
    ...data,
  });
}

export async function deleteCustomerPayment(id: number) {
  return ipc.client.customer.deleteCustomerPayment({
    id,
  });
}
