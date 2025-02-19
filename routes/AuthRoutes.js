const { Router } = require('express');
const AuthControllers = require('../controllers/AuthControllers.js');

const router = Router();

//auth routes
router.get('/signup', AuthControllers.signup_get);
router.post('/signup', AuthControllers.signup_post);
router.get('/login', AuthControllers.login_get);
router.post('/login', AuthControllers.login_post);
router.get('/logout', AuthControllers.logout_get);

module.exports = router;