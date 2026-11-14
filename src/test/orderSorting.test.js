import test from 'node:test'
import assert from 'node:assert'
import {
  getOrderTimestamp,
  calculateOrderElapsedTime,
  sortOrders,
} from '../utils/orderSorting.js'

test('getOrderTimestamp parses numeric createdAtTimestamp', () => {
  const ts = 1731500000000
  const order = { createdAtTimestamp: ts }
  assert.strictEqual(getOrderTimestamp(order), ts)
})

test('getOrderTimestamp parses ISO string', () => {
  const order = { createdAt: '2026-11-13T10:30:00.000Z' }
  const expected = new Date('2026-11-13T10:30:00.000Z').getTime()
  assert.strictEqual(getOrderTimestamp(order), expected)
})

test('getOrderTimestamp parses Brazilian date time format "DD/MM/YYYY às HH:mm"', () => {
  const order = { createdAt: '13/11/2026 às 10:30' }
  const ts = getOrderTimestamp(order)
  const d = new Date(ts)
  assert.strictEqual(d.getFullYear(), 2026)
  assert.strictEqual(d.getMonth(), 10) // 10 = November (0-indexed)
  assert.strictEqual(d.getDate(), 13)
  assert.strictEqual(d.getHours(), 10)
  assert.strictEqual(d.getMinutes(), 30)
})

test('calculateOrderElapsedTime returns correct label, text and severity thresholds', () => {
  const now = 1731502000000 // reference now
  // 5 min ago
  const orderNormal = { createdAtTimestamp: now - 5 * 60 * 1000 }
  const resNormal = calculateOrderElapsedTime(orderNormal, now)
  assert.strictEqual(resNormal.minutes, 5)
  assert.strictEqual(resNormal.label, '5 min')
  assert.strictEqual(resNormal.text, 'há 5 min')
  assert.strictEqual(resNormal.severity, 'normal')

  // 18 min ago (warning)
  const orderWarning = { createdAtTimestamp: now - 18 * 60 * 1000 }
  const resWarning = calculateOrderElapsedTime(orderWarning, now)
  assert.strictEqual(resWarning.minutes, 18)
  assert.strictEqual(resWarning.label, '18 min')
  assert.strictEqual(resWarning.text, 'há 18 min')
  assert.strictEqual(resWarning.severity, 'warning')

  // 35 min ago (urgent)
  const orderUrgent = { createdAtTimestamp: now - 35 * 60 * 1000 }
  const resUrgent = calculateOrderElapsedTime(orderUrgent, now)
  assert.strictEqual(resUrgent.minutes, 35)
  assert.strictEqual(resUrgent.label, '35 min')
  assert.strictEqual(resUrgent.severity, 'urgent')
})

test('sortOrders in kitchen mode sorts active orders with oldest first (FIFO)', () => {
  const order1 = { orderId: '101', createdAtTimestamp: 1000, status: 'preparo' } // oldest
  const order2 = { orderId: '102', createdAtTimestamp: 2000, status: 'preparo' }
  const order3 = { orderId: '103', createdAtTimestamp: 3000, status: 'preparo' } // newest

  // Input out of order
  const input = [order3, order1, order2]
  const sorted = sortOrders(input, 'kitchen', 'preparo')

  assert.strictEqual(sorted[0].orderId, '101') // oldest on top!
  assert.strictEqual(sorted[1].orderId, '102')
  assert.strictEqual(sorted[2].orderId, '103')
})

test('sortOrders in kitchen mode sorts completed orders with newest first (LIFO)', () => {
  const order1 = { orderId: '201', createdAtTimestamp: 1000, status: 'concluido' } // oldest
  const order2 = { orderId: '202', createdAtTimestamp: 2000, status: 'concluido' }
  const order3 = { orderId: '203', createdAtTimestamp: 3000, status: 'concluido' } // newest

  const input = [order1, order2, order3]
  const sorted = sortOrders(input, 'kitchen', 'concluido')

  assert.strictEqual(sorted[0].orderId, '203') // newest on top!
  assert.strictEqual(sorted[1].orderId, '202')
  assert.strictEqual(sorted[2].orderId, '201')
})

test('sortOrders tie breaks with orderId if timestamps are identical', () => {
  const orderA = { orderId: '9001', createdAtTimestamp: 5000, status: 'novo' }
  const orderB = { orderId: '9002', createdAtTimestamp: 5000, status: 'novo' }

  const sorted = sortOrders([orderB, orderA], 'kitchen', 'novo')
  assert.strictEqual(sorted[0].orderId, '9001')
  assert.strictEqual(sorted[1].orderId, '9002')
})
