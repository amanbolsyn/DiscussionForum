const jwt = require('jsonwebtoken');
const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const {checkUser }= require('../middleware/authMiddleware'); // Adjust the path as needed
const User = require('../models/user'); // Adjust the path as needed

// Mock environment variable
process.env.KEY = 'secretkey';

// Mock the User model
jest.mock('../models/user');

// Create a mock Express app for testing
const app = express();
app.use(express.json());
app.use(cookieParser()); // Add cookie-parser to parse cookies

// Add a test route that uses the checkUser middleware
app.get('/test', checkUser, (req, res) => {
  res.status(200).json({ user: res.locals.user });
});

describe('checkUser Middleware', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should set res.locals.user to the user if a valid token is provided', async () => {
    // Mock user data
    const mockUser = { _id: '123', username: 'testuser' };
    User.findById.mockResolvedValue(mockUser);

    // Generate a valid token
    const validToken = jwt.sign({ id: '123' }, process.env.KEY, { expiresIn: '1h' });

    // Make a request to the test route with the valid token
    const response = await request(app)
      .get('/test')
      .set('Cookie', `jwt=${validToken}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.user).toEqual(mockUser);
    expect(User.findById).toHaveBeenCalledWith('123');
  });

  it('should set res.locals.user to null if an invalid token is provided', async () => {
    // Generate an invalid token (e.g., signed with a different key)
    const invalidToken = jwt.sign({ id: '123' }, 'wrongkey', { expiresIn: '1h' });

    // Make a request to the test route with the invalid token
    const response = await request(app)
      .get('/test')
      .set('Cookie', `jwt=${invalidToken}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.user).toBeNull();
    expect(User.findById).not.toHaveBeenCalled();
  });

  it('should set res.locals.user to null if no token is provided', async () => {
    // Make a request to the test route without a token
    const response = await request(app)
      .get('/test');

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.user).toBeNull();
    expect(User.findById).not.toHaveBeenCalled();
  });
});