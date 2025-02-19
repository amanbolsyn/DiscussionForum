const { Router } = require('express')
const PostControllers = require('../controllers/PostControllers.js');
const { requireAuth, checkUser, checkRefreshToken } = require('../middleware/authMiddleware.js');

const router = Router();


router.get('*', checkUser);
router.get('/', requireAuth, checkRefreshToken, PostControllers.redirect_home);
router.get('/posts', requireAuth, checkRefreshToken, PostControllers.posts_get);
router.post('/posts', requireAuth, checkRefreshToken, PostControllers.post_post);


router.get('/post/:id', PostControllers.post_get);

//delete post routes
router.delete('/posts/:id', PostControllers.posts_delete);
router.delete('/post/:id', PostControllers.post_delete);


router.get('/new', PostControllers.newPosts_get);
router.get('/popular', PostControllers.popularPosts_get);

module.exports = router;