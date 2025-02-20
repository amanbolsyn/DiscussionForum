const { Router } = require('express');
const ProfileControllers = require('../controllers/ProfileControllers.js');

const router = Router();

//profile routes
router.get('/profile/:id', ProfileControllers.profile_get);
//router.get('/pofile/:id/statistics, ProfileControllers.profile_getStatistics);

module.exports = router;