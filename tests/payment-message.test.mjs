import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function load(file, mocks = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  new Function('require', 'module', 'exports', code)(name => mocks[name] ?? require(name), module, module.exports);
  return module.exports;
}
const helpers = load('src/lib/payment-message.ts');
const order = { id: 'order-1', orderNumber: 'EST-123', customerName: 'Alice', customerEmail: 'alice@example.com', paymentStatus: 'unpaid', status: 'pending', total: 130, items: [{ productName: 'Caméra', quantity: 2, price: 65 }] };
test('accepts HTTPS links and rejects unsafe or malformed links', () => {
  assert.equal(helpers.paymentLink(' https://pay.example.com/order?id=1 '), 'https://pay.example.com/order?id=1');
  for (const url of ['', 'broken', 'http://pay.example.com', 'javascript:alert(1)', 'https://user:password@example.com']) assert.equal(helpers.paymentLink(url), null);
});
test('message includes items, quantities, line totals, total and payment link', () => {
  const result = helpers.paymentMessage(order, 'https://pay.example.com/order');
  for (const text of ['Alice', 'EST-123', 'Caméra × 2', '130,00', 'Total à régler', 'https://pay.example.com/order']) assert.ok(result.includes(text), text);
});
test('email endpoint validates authorization and order state; sends server-derived content', async () => {
  let admin = false;
  let current = structuredClone(order);
  const calls = [];
  const { POST } = load('src/app/api/admin/orders/payment-message/route.ts', {
    '@/lib/adminAuth': { isAdmin: async () => admin },
    '@/lib/rateLimit': { rateLimit: () => null },
    '@/lib/store': { getOrderById: async () => current },
    '@/lib/payment-message': helpers,
    '@/lib/email': { sendPaymentRequestEmail: async (...args) => { calls.push(args); return 'email-id'; } },
  });
  const { NextRequest } = require('next/server');
  const req = (body, origin = 'https://shop.example.com') => new NextRequest('https://shop.example.com/api/admin/orders/payment-message', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const body = { orderId: order.id, url: 'https://pay.example.com/order' };
  assert.equal((await POST(req(body))).status, 401);
  admin = true;
  assert.equal((await POST(req(body, 'https://other.example.com'))).status, 403);
  assert.equal((await POST(req({ ...body, url: 'javascript:alert(1)' }))).status, 400);
  assert.equal((await POST(req({ ...body, customerEmail: 'other@example.com' }))).status, 400);
  current.paymentStatus = 'paid';
  assert.equal((await POST(req(body))).status, 409);
  current = null;
  assert.equal((await POST(req(body))).status, 404);
  assert.equal(calls.length, 0);
  current = structuredClone(order);
  const previous = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = 'test-only';
  try {
    assert.equal((await POST(req(body))).status, 200);
    assert.equal((await POST(req(body))).status, 200);
    assert.deepEqual(calls[0][0], order);
    assert.equal(calls[0][1], body.url);
    assert.equal(calls[0][2], calls[1][2]);
    assert.equal(current.paymentStatus, 'unpaid');
  } finally {
    if (previous === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previous;
  }
});
