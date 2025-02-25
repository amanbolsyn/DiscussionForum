const jwt = require('jsonwebtoken');
const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser'); // Add this
const {requireAuth} = require('../middleware/authMiddleware'); // Adjust the path as needed

// Mock environment variable
process.env.KEY = 'secretkey';

// Create a mock Express app for testing
const app = express();
app.use(express.json());
app.use(cookieParser()); // Add this to parse cookies

// Add a test route that uses the requireAuth middleware
app.get('/protected', requireAuth, (req, res) => {
  res.status(200).json({ message: 'Access granted' });
});

describe('requireAuth Middleware', () => {
  it('should call next() if a valid token is provided', async () => {
    // Generate a valid token
    const validToken = jwt.sign({ id: '123' }, process.env.KEY, { expiresIn: '1h' });

    // Make a request to the protected route with the valid token
    const response = await request(app)
      .get('/protected')
      .set('Cookie', `jwt=${validToken}`); // Set the cookie

    // Assert that the response is successful
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Access granted');
  });

  it('should redirect to /login if an invalid token is provided', async () => {
    // Generate an invalid token (e.g., signed with a different key)
    const invalidToken = jwt.sign({ id: '123' }, 'wrongkey', { expiresIn: '1h' });

    // Make a request to the protected route with the invalid token
    const response = await request(app)
      .get('/protected')
      .set('Cookie', `jwt=${invalidToken}`); // Set the cookie

    // Assert that the response is a redirect to /login
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/login');
  });

  it('should redirect to /login if no token is provided', async () => {
    // Make a request to the protected route without a token
    const response = await request(app)
      .get('/protected');

    // Assert that the response is a redirect to /login
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/login');
  });
});