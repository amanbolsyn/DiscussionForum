const { Router } = require('express')
const PostControllers = require('../controllers/PostControllers.js');
const { requireAuth, checkUser, checkRefreshToken } = require('../middleware/authMiddleware.js');
const { CheckPost } = require('../middleware/postMiddleware.js')

const router = Router();


router.get('*', checkUser);
router.get('/', requireAuth, checkRefreshToken, PostControllers.redirect_home);
router.get('/posts', requireAuth, checkRefreshToken, PostControllers.posts_get);
router.post('/posts', requireAuth, checkRefreshToken, CheckPost, PostControllers.post_post);


router.get('/post/:id', requireAuth, PostControllers.post_get);

//delete post routes
router.delete('/posts/:id', requireAuth, PostControllers.posts_delete);
router.delete('/post/:id',requireAuth,  PostControllers.post_delete);

//edit post routes
router.get('/post/:id/edit', requireAuth, PostControllers.post_edit)
router.put('/post/:id', requireAuth, PostControllers.post_put);


router.get('/new', requireAuth, PostControllers.newPosts_get);
router.get('/popular', requireAuth, PostControllers.popularPosts_get);

// Define route for each category
router.get('/posts/category/:category', requireAuth ,PostControllers.categoryPosts_get);

module.exports = router;