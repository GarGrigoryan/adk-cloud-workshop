import { FunctionTool } from '@google/adk';
import { z } from 'zod';
import { openDb } from '@techparts/shared';

// TODO(workshop): Implement the orders tools.
//
// You are building three tools backed by the SQLite `orders` and `customers`
// tables (orders columns: id, customer_id, sku, quantity, total, status,
// order_date, delivered_date):
//   1. get_customer_orders     — list a customer's orders (most recent first).
//   2. get_order_details       — full details for one order id.
//   3. check_return_eligibility — apply the 30-day return policy (from delivery date).
//
// Use openDb() to query the database (see shared/src/db.ts). The tests in
// test/tools.test.ts describe the exact shapes and policy rules you need.

export function getCustomerOrders(input: { customerId: number }): { customer?: any; orders: any[] } {
  // TODO: return `{ customer, orders: [...] }`, or `{ error, orders: [] }` if unknown.
  throw new Error('Not implemented: getCustomerOrders');
}

export function getOrderDetails(input: { orderId: number }): any {
  // TODO: return the full order, or `{ error }` if unknown.
  throw new Error('Not implemented: getOrderDetails');
}

export function checkReturnEligibility(input: { orderId: number }): any {
  // TODO: apply the 30-day-from-delivery policy and return
  // `{ eligible, reason, daysLeft? }`.
  throw new Error('Not implemented: checkReturnEligibility');
}

export const getCustomerOrdersTool = new FunctionTool({
  name: 'get_customer_orders',
  description: 'TODO: describe this tool so the model knows when and how to call it.',
  parameters: z.object({
    // TODO: define the parameters (e.g. customerId) with .describe() hints.
  }),
  execute: async () => getCustomerOrders({ customerId: 0 }),
});

export const getOrderDetailsTool = new FunctionTool({
  name: 'get_order_details',
  description: 'TODO: describe this tool so the model knows when and how to call it.',
  parameters: z.object({
    // TODO: define the parameters (e.g. orderId) with .describe() hints.
  }),
  execute: async () => getOrderDetails({ orderId: 0 }),
});

export const checkReturnEligibilityTool = new FunctionTool({
  name: 'check_return_eligibility',
  description: 'TODO: describe this tool so the model knows when and how to call it.',
  parameters: z.object({
    // TODO: define the parameters (e.g. orderId) with .describe() hints.
  }),
  execute: async () => checkReturnEligibility({ orderId: 0 }),
});
