const User = require('../models/user');
const Post = require('../models/post');

const jwt = require('jsonwebtoken');


module.exports.profile_get = (req, res) => {

    const id = req.params.id;
    const refreshToken = req.cookies['refresh-token']; // Accessing 'refresh-token' from cookies

    // Find the user by ID
    User.findById(id)
        .then((user) => {
            // Fetch the user's posts
            Post.find({ author: id })  // Assuming `userId` is the field linking posts to users
                .then(async (posts) => {

                    // Check if the refresh token stored in the DB matches the one in the cookies
                    if (user.refreshToken !== refreshToken) {

                        //show sensative information if you are the current user
                        res.status(200).render('UserProfile', {
                            posts: posts,
                            title: 'Profile ' + user.nickname,
                            nickname: user.nickname,
                        });



                    } else {
                        //show sensative information if you are the current user
                        res.status(200).render('MyProfile', {
                            user: user,
                            title: 'Profile ' + user.nickname,
                            posts: posts
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).send('Error fetching posts');
                });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error fetching user');
        });
}

module.exports.profile_getStatistics = (req, res) => {

    res.status(200).render('statistics', {title: 'Statistics'})
};
