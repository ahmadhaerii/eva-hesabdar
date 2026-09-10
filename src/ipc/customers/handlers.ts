import { customerService } from "@/database/services/customer.service";
import { os } from "@orpc/server";
import { z } from "zod";

// customer
export const listCustomers = os.handler(async () => {
  try {
    const list = await customerService.listCustomers();
    return list;
  } catch (error) {
    console.error("error", error);
  }
});

const createCustomerInput = z.object({
  displayName: z.string().min(1),
  description: z.string().nullable().optional(),
  customProfitPercent: z.number().nullable().optional(),
  nationalId: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  mobile: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  customerTypeId: z.number().min(1),
  isActive: z.boolean().optional(),
  isAnonymous: z.boolean().optional(),
});
const updateCustomerInput = z.object({
  id: z.number(),
  displayName: z.string().min(1),
  description: z.string().nullable().optional(),
  customProfitPercent: z.number().nullable().optional(),
  nationalId: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  mobile: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  customerTypeId: z.number().min(1),
  isActive: z.boolean().optional(),
  isAnonymous: z.boolean().optional(),
});

const deleteCustomerInput = z.object({
  id: z.number(),
});

export const createCustomer = os
  .input(createCustomerInput)
  .handler(async ({ input }) => {
    console.log("aaaa");

    return customerService.createCustomer({
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      deletedAt: null,
    });
  });

export const updateCustomer = os
  .input(updateCustomerInput)
  .handler(async ({ input }) => {
    const { id, ...data } = input;
    return customerService.updateCustomer(id, data);
  });

export const deleteCustomer = os
  .input(deleteCustomerInput)
  .handler(async ({ input }) => {
    return customerService.deleteCustomer(input.id);
  });

// customerType

const createCustomerTypeInput = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  profitPercent: z.number().min(1),
  isActive: z.boolean().optional(),
});
const updateCustomerTypeInput = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  profitPercent: z.number().min(1),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

const deleteCustomerTypeInput = z.object({
  id: z.number(),
});

export const listCustomerType = os.handler(async () => {
  return customerService.listCustomerTypes();
});

export const createCustomerType = os
  .input(createCustomerTypeInput)
  .handler(async ({ input }) => {
    return customerService.createCustomerType({
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      deletedAt: null,
    });
  });

export const updateCustomerType = os
  .input(updateCustomerTypeInput)
  .handler(async ({ input }) => {
    const { id, ...data } = input;
    return customerService.updateCustomerType(id, data);
  });

export const deleteCustomerType = os
  .input(deleteCustomerTypeInput)
  .handler(async ({ input }) => {
    return customerService.deleteCustomerType(input.id);
  });

export const listCustomerPayment = os.handler(async () => {
  return customerService.listCustomerPayments();
});

// CustomerPayment

const createCustomerPaymentInput = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  profitPercent: z.number().min(1),
  isActive: z.boolean().optional(),
});
const updateCustomerPaymentInput = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  profitPercent: z.number().min(1),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

const deleteCustomerPaymentInput = z.object({
  id: z.number(),
});

export const createCustomerPayment = os
  .input(createCustomerPaymentInput)
  .handler(async ({ input }) => {
    return customerService.createCustomerPayment({
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      deletedAt: null,
    });
  });

export const updateCustomerPayment = os
  .input(updateCustomerPaymentInput)
  .handler(async ({ input }) => {
    const { id, ...data } = input;
    return customerService.updateCustomerPayment(id, data);
  });

export const deleteCustomerPayment = os
  .input(deleteCustomerPaymentInput)
  .handler(async ({ input }) => {
    return customerService.deleteCustomerPayment(input.id);
  });
