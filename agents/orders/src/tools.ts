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

export async function getCustomerOrders(input: { customerId: number }): Promise<{ customer?: any; orders: any[]; error?: string }> {
  const db = await openDb();

  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(input.customerId);
  if (!customer) {
    return { error: 'Unknown customer', orders: [] };
  }

  const orders = db.prepare('SELECT * FROM orders WHERE customer_id = ? ORDER BY order_date DESC').all(input.customerId);
  return { customer, orders };
}

export async function getOrderDetails(input: { orderId: number }): Promise<any> {
  const db = await openDb();

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(input.orderId);
  if (!order) {
    return { error: `Order with ID ${input.orderId} not found` };
  }
  return order;
}

export async function checkReturnEligibility(input: { orderId: number }): Promise<{ eligible: boolean; reason: string; daysLeft?: number }> {
  const db = await openDb();

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(input.orderId);
  if (!order) {
    return { eligible: false, reason: 'Order not found' };
  }

  if (order.status !== 'delivered' || !order.delivered_date) {
    return { eligible: false, reason: `Order status is currently '${order.status}'. Items must be delivered to qualify for returns.` };
  }

  const deliveryDate = new Date(String(order.delivered_date));
  const currentDate = new Date();

  const msPerDay = 24 * 60 * 60 * 1000;
  const timeDifference = currentDate.getTime() - deliveryDate.getTime();
  const daysPassed = Math.floor(timeDifference / msPerDay);
  const daysLeft = 30 - daysPassed;

  if (daysLeft < 0) {
    return {
      eligible: false,
      reason: `Return window expired. Item was delivered on ${order.delivered_date} (${daysPassed} days ago), exceeding the 30-day policy.`
    };
  }

  return {
    eligible: true,
    reason: `Item is eligible for return. Deliver date: ${order.delivered_date}.`,
    daysLeft: daysLeft
  };
}

export const getCustomerOrdersTool = new FunctionTool({
  name: 'get_customer_orders',
  description: 'Retrieves a customer profile and lists all their historical orders sorted by most recent first.',
  parameters: z.object({
    customerId: z.number().describe('The unique numeric database identifier of the customer.'),
  }),
  execute: async (input) => getCustomerOrders(input),
});

export const getOrderDetailsTool = new FunctionTool({
  name: 'get_order_details',
  description: 'Fetches the complete column details for a single specific order tracking identifier, including pricing, quantity, and current status.',
  parameters: z.object({
    orderId: z.number().describe('The unique numeric order ID.'),
  }),
  execute: async (input) => getOrderDetails(input),
});

export const checkReturnEligibilityTool = new FunctionTool({
  name: 'check_return_eligibility',
  description: 'Evaluates if a specific order ID can be returned based on the strict 30-day delivery-date return window constraint.',
  parameters: z.object({
    orderId: z.number().describe('The unique numeric order ID being evaluated for a return.'),
  }),
  execute: async (input) => checkReturnEligibility(input),
});
