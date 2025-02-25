const { Router } = require('express');
const AuthControllers = require('../controllers/AuthControllers.js');
const {CheckPasswordStrength} = require('../middleware/authMiddleware.js')

const router = Router();

//auth routes
router.get('/signup', AuthControllers.signup_get);
router.post('/signup', CheckPasswordStrength, AuthControllers.signup_post);
router.get('/login', AuthControllers.login_get);
router.post('/login', AuthControllers.login_post);
router.get('/logout', AuthControllers.logout_get);
router.post('/verify-2fa', AuthControllers.verify_2fa_post);

module.exports = router;