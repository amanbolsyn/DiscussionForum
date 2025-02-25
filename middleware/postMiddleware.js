const Post = require('../models/post');

//checks title, body and category of the created post before saving it to the bd
const CheckPost = (req, res, next) => {

    const errors = { title: '', body: '', categories: '' };
    const post = req.body;
    let isCorrect = true;


    if (post.title.trim() === '') {
        errors.title = "Post tittle cannot be empty"
        isCorrect = false;
    }

    if (post.body.trim() === '') {
        errors.body = "Post body cannot be empty"
        isCorrect = false;
    }

    if (post.categories.trim() === '') {
        errors.categories = "Post has to have a category"
        isCorrect = false;
    }

    if (!isCorrect) {
        return res.status(400).json({ errors });
    }


    next();
};

module.exports = { CheckPost };