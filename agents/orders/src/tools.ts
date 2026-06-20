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

export function getCustomerOrders(input: { customerId: number }): { customer?: any; orders: any[]; error?: string } {
  const db = openDb();

  const customer = db.get('SELECT * FROM customers WHERE id = ?', [input.customerId]);
  if (!customer) {
    return { error: `Customer with ID ${input.customerId} not found.`, orders: [] };
  }

  const orders = db.all(
    `SELECT o.*, p.name AS productName 
     FROM orders o
     LEFT JOIN products p ON o.sku = p.sku
     WHERE o.customer_id = ?
     ORDER BY o.order_date DESC`,
    [input.customerId]
  );

  return { customer, orders: orders || [] };
}

export function getOrderDetails(input: { orderId: number }): any {
  const db = openDb();

  const order = db.get(
    `SELECT id, customer_id AS customerId, sku, quantity, total, status, order_date AS orderDate, delivered_date AS deliveredDate 
     FROM orders 
     WHERE id = ?`,
    [input.orderId]
  );

  if (!order) {
    return { error: `Order with ID ${input.orderId} not found.` };
  }

  return order;
}

export function checkReturnEligibility(input: { orderId: number }): any {
  const db = openDb();

  const order = db.get('SELECT status, delivered_date FROM orders WHERE id = ?', [input.orderId]);
  if (!order) {
    return { eligible: false, reason: `Order not found.` };
  }

  if (order.status !== 'delivered') {
    return { 
      eligible: false, 
      reason: `Order is not eligible for return because its current status is '${order.status}'.` 
    };
  }

  if (!order.delivered_date) {
    return { eligible: false, reason: 'Order does not have a valid delivery date.' };
  }

  const deliveryMs = new Date(order.delivered_date).getTime();
  const currentMs = Date.now();
  const msElapsed = currentMs - deliveryMs;
  const daysElapsed = msElapsed / (1000 * 60 * 60 * 24);

  if (daysElapsed > 30) {
    return { 
      eligible: false, 
      reason: `The 30-day return window has expired. It has been ${Math.floor(daysElapsed)} days since delivery.` 
    };
  }

  const daysLeft = 30 - daysElapsed;

  return {
    eligible: true,
    reason: 'Order is within the 30-day return eligibility window.',
    daysLeft: Math.round(daysLeft * 10) / 10 
  };
}

export const getCustomerOrdersTool = new FunctionTool({
  name: 'get_customer_orders',
  description: "Retrieve a customer's history of placed orders sorted by most recent first along with relevant product details.",
  parameters: z.object({
    customerId: z.number().describe('The distinct numeric identification number assigned to the customer.'),
  }),
  execute: async (args) => getCustomerOrders(args),
});

export const getOrderDetailsTool = new FunctionTool({
  name: 'get_order_details',
  description: 'Lookup and inspect the extensive detail profile records for a specific order identifier.',
  parameters: z.object({
    orderId: z.number().describe('The primary numeric unique key identifier assigned to an individual order.'),
  }),
  execute: async (args) => getOrderDetails(args),
});

export const checkReturnEligibilityTool = new FunctionTool({
  name: 'check_return_eligibility',
  description: 'Evaluate whether an itemized customer order qualifies for product return reimbursement according to the strict 30-day delivery policy constraints.',
  parameters: z.object({
    orderId: z.number().describe('The single tracking identifier key pointing to the target order.'),
  }),
  execute: async (args) => checkReturnEligibility(args),
});