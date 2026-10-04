import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function load(file) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  new Function('require', 'module', 'exports', code)(name => name.startsWith('.') ? load(path.resolve(path.dirname(file), `${name}.ts`)) : require(name), module, module.exports);
  return module.exports;
}
const { isFrenchPhone, normalizeFrenchPhone } = load('src/lib/checkout-fr.ts');
const { createOrderSchema } = load('src/lib/validation.ts');
test('French local and international numbers normalize consistently', () => {
  for (const phone of ['06 12 34 56 78', '+33 6 12 34 56 78', '0033 6 12 34 56 78', '06.12.34.56.78']) {
    assert.equal(isFrenchPhone(phone), true);
    assert.equal(normalizeFrenchPhone(phone), '+33612345678');
  }
  assert.equal(isFrenchPhone('01 23 45 67 89'), true);
  assert.equal(isFrenchPhone('+212612345678'), false);
  assert.equal(isFrenchPhone('123'), false);
});
const order = { items: [{productId: 1, price: 55, quantity: 1}], address: {street: '12 rue de la Paix', city: 'Paris', zip: '75002'}, customer: {firstName: 'Test', lastName: 'Client', phone: '06 12 34 56 78'} };
test('orders store France, postcode and normalized phone', () => {
  const result = createOrderSchema.parse(order);
  assert.equal(result.address.country, 'France');
  assert.equal(result.address.postalCode, '75002');
  assert.equal(result.customer.phone, '+33612345678');
});
test('invalid French address and phone are rejected by the server schema', () => {
  assert.equal(createOrderSchema.safeParse({...order, address: {...order.address, zip: '7500'}}).success, false);
  assert.equal(createOrderSchema.safeParse({...order, customer: {...order.customer, phone: '+212612345678'}}).success, false);
});
