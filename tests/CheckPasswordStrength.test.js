const request = require('supertest');
const express = require('express');
const { CheckPasswordStrength } = require('../middleware/authMiddleware'); // Adjust path accordingly

const app = express();
app.use(express.json());
app.post('/register', CheckPasswordStrength, (req, res) => {
  res.status(200).send('Password is strong');
});

describe('CheckPasswordStrength Middleware', () => {
  it('should return an error if password does not contain an uppercase letter', async () => {
    const res = await request(app)
      .post('/register')
      .send({ password: 'password123!' });
    expect(res.status).toBe(400);
    expect(res.body.errors.password).toBe('Password has to have at least one uppercase letter');
  });

  it('should return an error if password does not contain a digit', async () => {
    const res = await request(app)
      .post('/register')
      .send({ password: 'Password!' });
    expect(res.status).toBe(400);
    expect(res.body.errors.password).toBe('Password has to have at least one digit');
  });

  it('should return an error if password does not contain a special character', async () => {
    const res = await request(app)
      .post('/register')
      .send({ password: 'Password123' });
    expect(res.status).toBe(400);
    expect(res.body.errors.password).toBe('Password has to have one special character');
  });

  it('should allow password if it meets all criteria', async () => {
    const res = await request(app)
      .post('/register')
      .send({ password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(res.text).toBe('Password is strong');
  });
});
