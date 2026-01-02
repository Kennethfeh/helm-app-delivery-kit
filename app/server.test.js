const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { once } = require('node:events');
const { createApp } = require('./server');

const listen = async (t) => {
  const server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  return request(server);
};

test('health endpoint works', async (t) => {
  const agent = await listen(t);
  const res = await agent.get('/healthz');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('message endpoint returns payload', async (t) => {
  const agent = await listen(t);
  const res = await agent.get('/api/message');
  assert.equal(res.status, 200);
  assert.ok(res.body.message);
});
