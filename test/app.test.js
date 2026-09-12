import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Submission from '../src/models/Submission.js';

let mongod;

before(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

after(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});

beforeEach(async () => {
  await Submission.deleteMany({});
});

test('GET / renders the catch-all form', async () => {
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.match(res.text, /<form method="POST" action="\/submit"/);
  assert.match(res.text, /name="name"/);
  assert.match(res.text, /name="email"/);
  // Ensure autocomplete="off" is present to prevent suggestions
  assert.match(res.text, /autocomplete="off"/);
});

test('GET /any/deep/subpath shows the exact same form on any page', async () => {
  const res = await request(app).get('/some/very/deep/nested/page/123');
  assert.equal(res.status, 200);
  assert.match(res.text, /Catch-All Form/);
  assert.match(res.text, /name="email"/);
  assert.match(res.text, /\/some\/very\/deep\/nested\/page\/123/);
});

test('Wildcard subdomain: catches any subdomain like kadkmakdma.domain.com', async () => {
  const res = await request(app)
    .get('/landing')
    .set('Host', 'kadkmakdma.domain.com');

  assert.equal(res.status, 200);
  assert.match(res.text, /kadkmakdma\.domain\.com/);
  assert.match(res.text, /name="name"/);
  assert.match(res.text, /name="email"/);
});

test('POST /submit saves name and email to MongoDB without validation', async () => {
  const res = await request(app)
    .post('/submit')
    .set('Host', 'kadkmakdma.domain.com')
    .type('form')
    .send({ name: 'Alice Smith', email: 'alice@example.com' });

  assert.equal(res.status, 201);
  assert.match(res.text, /Saved successfully!/);
  assert.match(res.text, /Alice Smith/);
  assert.match(res.text, /alice@example\.com/);

  // Verify in MongoDB
  const saved = await Submission.findOne({ email: 'alice@example.com' });
  assert.ok(saved);
  assert.equal(saved.name, 'Alice Smith');
  assert.equal(saved.email, 'alice@example.com');
  assert.equal(saved.host, 'kadkmakdma.domain.com');
});

test('POST /submit saves completely invalid/non-email values without any validation', async () => {
  // Any string or non-email should be saved without throwing validation errors
  const res = await request(app)
    .post('/submit')
    .type('form')
    .send({ name: 'Bob!@#$%^&*()', email: 'not an email at all!!' });

  assert.equal(res.status, 201);
  assert.match(res.text, /Saved successfully!/);

  const saved = await Submission.findOne({ name: 'Bob!@#$%^&*()' });
  assert.ok(saved);
  assert.equal(saved.email, 'not an email at all!!');
});

test('POST on any arbitrary subpath catches the submission and saves it', async () => {
  const res = await request(app)
    .post('/any/random/subpath')
    .set('Host', 'wildcard.customdomain.org')
    .type('form')
    .send({ name: 'Charlie', email: 'charlie@test.org' });

  assert.equal(res.status, 201);

  const saved = await Submission.findOne({ name: 'Charlie' });
  assert.ok(saved);
  assert.equal(saved.email, 'charlie@test.org');
  assert.equal(saved.host, 'wildcard.customdomain.org');
});

test('JSON API request returns JSON response', async () => {
  const res = await request(app)
    .post('/submit')
    .set('Accept', 'application/json')
    .send({ name: 'JSON User', email: 'json@test.com' });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.name, 'JSON User');
  assert.equal(res.body.data.email, 'json@test.com');
});

test('POST /submit rejects empty form submission with 400 Bad Request', async () => {
  const res = await request(app)
    .post('/submit')
    .type('form')
    .send({ name: '', email: '' });

  assert.equal(res.status, 400);
  assert.match(res.text, /Form cannot be empty/);

  // Verify nothing was saved in MongoDB
  const count = await Submission.countDocuments();
  assert.equal(count, 0);
});

test('POST /submit rejects whitespace-only submission with 400 Bad Request', async () => {
  const res = await request(app)
    .post('/submit')
    .type('form')
    .send({ name: '   ', email: '   ' });

  assert.equal(res.status, 400);
  assert.match(res.text, /Form cannot be empty/);

  const count = await Submission.countDocuments();
  assert.equal(count, 0);
});

test('POST /submit rejects missing name or email with 400 Bad Request', async () => {
  const resNoName = await request(app)
    .post('/submit')
    .type('form')
    .send({ name: '', email: 'alice@example.com' });

  assert.equal(resNoName.status, 400);
  assert.match(resNoName.text, /Name cannot be empty/);

  const resNoEmail = await request(app)
    .post('/submit')
    .type('form')
    .send({ name: 'Alice', email: '' });

  assert.equal(resNoEmail.status, 400);
  assert.match(resNoEmail.text, /Email cannot be empty/);
});

test('POST /submit rejects empty JSON payload with 400 JSON response', async () => {
  const res = await request(app)
    .post('/submit')
    .set('Accept', 'application/json')
    .send({});

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.error, /Form cannot be empty/);
});

test('GET / form inputs have required attribute and no readonly attribute', async () => {
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.match(res.text, /required/);
  assert.doesNotMatch(res.text, /readonly/);
});

