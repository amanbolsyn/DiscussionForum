const express = require('express');
const mongoose = require('mongoose');
const PostRoutes = require('./routes/PostRoutes');
const AuthRoutes = require('./routes/AuthRoutes');
const ProfileRoutes = require('./routes/ProfileRoutes');

const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const logger = require('./logs/logger');
const { CheckPost } = require('./middleware/postMiddleware');

const request = require('supertest');
const jest = require('jest');

// Load environment variables
dotenv.config();

// Express app setup
const app = express();

// Register view engine
app.set('view engine', 'ejs');

// Middleware and static files (images, styles)
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    logger.info('Request processed', { caller: __filename, hostname: req.hostname, method: req.method, path: req.path, status: res.statusCode });
    next();
});

// Register routes
app.use(PostRoutes);
app.use(AuthRoutes);
app.use(ProfileRoutes);

// 404 page
app.use((req, res) => {
    res.status(404).render('404', { title: "Error: 404" });
    logger.info('Request processed', { caller: __filename, hostname: req.hostname, method: req.method, path: req.path, status: res.statusCode });
});

// Mock database connection (for testing purposes)
const dbURI = process.env.DB_URL;
mongoose.connect(dbURI)
    .then(() => {
        // Test the middleware before starting the server
        runTestsBeforeStartingServer().then(() => {
            // Start the application server after the test
            app.listen(process.env.PORT, () => {
                logger.info('Server is running at port ' + process.env.PORT, { caller: __filename });
                logger.info('Database is successfully connected', { caller: __filename });
            });
        }).catch(err => {
            logger.error('Test failed before starting server: ' + err, { caller: __filename });
        });
    })
    .catch((err) => logger.error('Error occurred: ' + err, { filepath: __filename }));

// Function to run tests before starting the app
async function runTestsBeforeStartingServer() {
    return new Promise((resolve, reject) => {
        // Run Jest tests programmatically
        jest.runCLI({}, [__dirname])
            .then(result => {
                const testResults = result.results;
                if (testResults.numFailedTests > 0) {
                    reject('Tests failed. Server not started.');
                } else {
                    resolve();
                }
            })
            .catch(err => {
                reject('Error running tests: ' + err);
            });
    });
}
