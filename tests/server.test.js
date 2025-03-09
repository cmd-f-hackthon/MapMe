const express = require('express');
const request = require('supertest');

const app = express();
const port = 8080;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

let server;

describe('GET /', () => {
  beforeAll((done) => {
    server = app.listen(port, () => {
      console.log(`Test Server is running on http://localhost:${port}`);
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should return Hello World!', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello World!');
  });
});