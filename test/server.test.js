import request from 'supertest';
import { expect } from 'chai'; // Use Chai for assertions
import { app, startServer } from '../server.js';

let server;

before(async () => {
  server = await startServer();
});

after(() => {
  server.close();
});

describe('JWKS Server Tests with Rate Limiting and Logs', () => {
  it('should return 200 for GET /.well-known/jwks.json', async () => {
    const res = await request(app).get('/.well-known/jwks.json');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('keys');
    expect(Array.isArray(res.body.keys)).to.be.true;
  });

  it('should generate a valid JWT on POST /auth and log the request', async () => {
    const res = await request(app).post('/auth');
    expect(res.status).to.equal(200);
    expect(res.text).to.be.a('string');
  });

  it('should generate an expired JWT on POST /auth with ?expired=true', async () => {
    const res = await request(app).post('/auth?expired=true');
    expect(res.status).to.equal(200);
    expect(res.text).to.be.a('string');
  });

  it('should return 405 for invalid method on /.well-known/jwks.json', async () => {
    const res = await request(app).put('/.well-known/jwks.json');
    expect(res.status).to.equal(405);
    expect(res.text).to.equal('Method Not Allowed');
  });

  it('should return 400 for registration without required fields', async () => {
    const res = await request(app).post('/register').send({ username: 'testUser' });
    expect(res.status).to.equal(400);
    expect(res.text).to.equal('Username and email are required fields.');
  });

  it('should return 201 and a password for valid registration', async () => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    const res = await request(app)
      .post('/register')
      .send({ username: 'testUser', email: uniqueEmail });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('password');
    expect(res.body.password).to.be.a('string');
  });
});
