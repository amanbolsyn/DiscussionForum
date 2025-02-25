const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { CheckPost } = require('../middleware/postMiddleware'); // Make sure to import your middleware

// Mock your app
const app = express();

// You can register the middleware here
app.use(express.json()); // For parsing JSON requests
app.use('/posts', CheckPost, (req, res) => {
    // Dummy handler to pass the test if validation is successful
    res.status(200).json({ message: 'Post created successfully' });
});

describe('CheckPost Middleware Tests', () => {
    beforeAll(async () => {
        // Mock database connection
        const dbURI = 'mongodb://localhost:27017/testdb'; // Use a test DB
        await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        // Close DB connection after tests
        await mongoose.connection.close();
    });

    it('should pass the validation and create a post', async () => {
        const postData = {
            title: 'Valid Post Title',
            body: 'This is a valid body for the post.',
            categories: 'Technology',
        };

        const response = await request(app)
            .post('/posts')
            .send(postData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Post created successfully');
    });

    it('should fail if title is empty', async () => {
        const postData = {
            title: '',
            body: 'This is a valid body for the post.',
            categories: 'Technology',
        };

        const response = await request(app)
            .post('/posts')
            .send(postData);

        expect(response.status).toBe(400);
        expect(response.body.errors.title).toBe('Post tittle cannot be empty');
    });

    it('should fail if body is empty', async () => {
        const postData = {
            title: 'Valid Post Title',
            body: '',
            categories: 'Technology',
        };

        const response = await request(app)
            .post('/posts')
            .send(postData);

        expect(response.status).toBe(400);
        expect(response.body.errors.body).toBe('Post body cannot be empty');
    });

    it('should fail if categories are empty', async () => {
        const postData = {
            title: 'Valid Post Title',
            body: 'This is a valid body for the post.',
            categories: '',
        };

        const response = await request(app)
            .post('/posts')
            .send(postData);

        expect(response.status).toBe(400);
        expect(response.body.errors.categories).toBe('Post has to have a category');
    });
});
