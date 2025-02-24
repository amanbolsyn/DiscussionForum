const Post = require('../models/post');
const User = require('../models/user');

const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');


//twilio thrid package api to send sms to a phone number
const twilio = require('twilio');
const dotenv = require('dotenv');

//load environment vars
dotenv.config();

// Twilio client setup
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

//redirects to home page 
module.exports.redirect_home = (req, res) => {
    res.status(200).redirect('/posts');
}

module.exports.posts_get = (req, res) => {
    // Get all posts
    Post.find()
        .then(async (posts) => {
            // Get all users with their _id and nickname
            const users = await User.find().select('nickname _id');

            // Create a mapping from user ID to nickname
            const userMap = new Map();
            users.forEach(user => {
                userMap.set(user._id.toString(), user.nickname); // Convert _id to string for easier matching
            });

            // Attach nickname to each post
            const postsWithNicknames = posts.map(post => {
                // Assuming post.author is the user ID
                const authorNickname = userMap.get(post.author.toString());
                return {
                    ...post.toObject(), // Convert Mongoose document to plain object
                    authorNickname: authorNickname // Attach nickname
                };
            });

            // console.log(postsWithNicknames)

            // Render the home page with posts and their author nickname
            res.status(200).render('home', { posts: postsWithNicknames, title: 'Discussion forum' });
        })
        .catch((err) => {
            console.log(err);
        });
}


module.exports.post_get = (req, res) => {
    const id = req.params.id;
    //console.log(id)

    Post.findById(id)
        .then(async (result) => {
            const user = await User.findById(result.author);
            res.status(200).render('post', { post: result, title: result.title, author: user.nickname, user_id: user._id })
        })
        .catch((err) => {
            console.log(err);
        })
}


// module.exports.post_post = async (req, res) => {
//     const post = new Post(req.body);

//     // console.log(post);

//     const accessToken = req.cookies['jwt']; // Accessing 'jwt' from cookies
//     // Decode the refresh token to get the user ID
//     const decoded = jwt.verify(accessToken, process.env.KEY);
//     const id = decoded.id;

//     // Find the user in the database
//     const user = await User.findById(id);
//     post.author = user.id

//     post.save()
//         .then((result) => {
//             // Send SMS after saving the post
//             const messageBody = `A new post has been created: ${result.title}`;
//             const recipientPhoneNumber = "+77021345823"; // Phone number to receive the SMS (can be admin or user)

//             client.messages.create({
//                 to: recipientPhoneNumber, // Recipient's phone number
//                 from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
//                 body: messageBody, // Message content
//             })
//                 .then((message) => {
//                     console.log('SMS sent successfully:', message.sid);
//                     res.status(200).redirect('/posts'); // Redirect to posts list after sending SMS
//                 })
//                 .catch((err) => {
//                     console.error('Failed to send SMS:', err);
//                     res.status(500).send('Error occurred while sending SMS.');
//                 });
//         })
//         .catch((err) => {
//             console.log('Error saving post:', err);
//             res.status(500).send('Error occurred while saving the post.');
//         });

// };


module.exports.post_post = async (req, res) => {

    const post = new Post(req.body);

    const accessToken = req.cookies['jwt']; // Accessing 'jwt' from cookies
    // Decode the refresh token to get the user ID
    const decoded = jwt.verify(accessToken, process.env.KEY);
    const id = decoded.id;

    // Find the user in the database
    const user = await User.findById(id);
    post.author = user.id

    post.save()
        .then((result) => {
            res.status(200).redirect('/posts');
        })
        .catch((err) => {
            console.log('Error saving post:', err);
            res.status(500).send('Error occurred while saving the post.');
        });

}

module.exports.posts_delete = (req, res) => {
    const id = req.params.id;

    //deletes record by id and deletes it 
    Post.findByIdAndDelete(id)
        .then((result) => {
            res.status(200).json({ redirect: '/posts' })
        })
        .catch((err) => {
            console.log(err)
        })
};

module.exports.post_delete = (req, res) => {
    const postId = req.params.id;
    const refreshToken = req.cookies['refresh-token']; // Accessing 'refresh-token' from cookies

    //deletes record by id and deletes it 
    Post.findById(postId)
        .then((post) => {

            userId = post.author;

            User.findById(userId)
                .then((user) => {

                    if (refreshToken === user.refreshToken) {

                        Post.deleteOne({ _id: new ObjectId(postId) })
                            .then((result) => {
                                console.log('deleted')
                                res.status(200).json({ redirect: '/profile' })
                            })
                            .catch((err) => {
                                console.log(err);
                            })
                    }

                })

                .catch((err) => {
                    console.log(err)
                })
        })
        .catch((err) => {
            console.log(err)
        })
};


module.exports.post_edit = (req, res) => {
    const id = req.params.id;
    const refreshToken = req.cookies['refresh-token'];

    
    Post.findById(id)

        .then(async (post) => {

          User.findById(post.author)
           .then((user) => {
               
            if(user.refreshToken === refreshToken){
                res.json({
                    title: post.title,
                    body: post.body,
                    categories: post.categories,
                    isvalidUser: true,
                  });
            } else {
                res.json({
                    isValidUser: false,
                });
            }
           }) 
            .catch((err) => {
                console.log(err)
            })
        })
        .catch((err) => {
            console.log(err);
        })
}


//renders new posts page
module.exports.newPosts_get = async (req, res) => {

    // Get all posts
    Post.find().sort({ date: -1 })
        .then(async (posts) => {
            // Get all users with their _id and nickname
            const users = await User.find().select('nickname _id');

            // Create a mapping from user ID to nickname
            const userMap = new Map();
            users.forEach(user => {
                userMap.set(user._id.toString(), user.nickname); // Convert _id to string for easier matching
            });

            // Attach nickname to each post
            const postsWithNicknames = posts.map(post => {
                // Assuming post.author is the user ID
                const authorNickname = userMap.get(post.author.toString());
                return {
                    ...post.toObject(), // Convert Mongoose document to plain object
                    authorNickname: authorNickname // Attach nickname
                };
            });

            // Render the 'newPosts' page with the posts and title
            res.status(200).render('newPosts', { posts: postsWithNicknames, title: 'Recent posts' })
        })
        .catch((error) => {
            // Handle error (e.g., if there is a database issue)
            console.error('Error fetching posts:', error);
            res.status(500).send('Server Error');
        });
};

//renders popular posts page
module.exports.popularPosts_get = (req, res) => {

    Post.find().sort({ likes: -1 })
        .then(async (posts) => {
            // Get all users with their _id and nickname
            const users = await User.find().select('nickname _id');

            // Create a mapping from user ID to nickname
            const userMap = new Map();
            users.forEach(user => {
                userMap.set(user._id.toString(), user.nickname); // Convert _id to string for easier matching
            });

            // Attach nickname to each post
            const postsWithNicknames = posts.map(post => {
                // Assuming post.author is the user ID
                const authorNickname = userMap.get(post.author.toString());
                return {
                    ...post.toObject(), // Convert Mongoose document to plain object
                    authorNickname: authorNickname // Attach nickname
                };
            });


            //console.log(posts);
            // Render the 'newPosts' page with the posts and title
            res.status(200).render('popularPosts', { posts: postsWithNicknames, title: 'Popular posts' })
        })
        .catch((error) => {
            // Handle error (e.g., if there is a database issue)
            console.error('Error fetching posts:', error);
            res.status(500).send('Server Error');
        });
};

module.exports.categoryPosts_get = (req, res) => {

    const categoryName = req.params.category; // Get category from the URL

    // Find posts that belong to this category
    Post.find({ categories: categoryName })
        .then(async (posts) => {
            // Get all users with their _id and nickname
            const users = await User.find().select('nickname _id');

            // Create a mapping from user ID to nickname
            const userMap = new Map();
            users.forEach(user => {
                userMap.set(user._id.toString(), user.nickname); // Convert _id to string for easier matching
            });

            // Attach nickname to each post
            const postsWithNicknames = posts.map(post => {
                // Assuming post.author is the user ID
                const authorNickname = userMap.get(post.author.toString());
                return {
                    ...post.toObject(), // Convert Mongoose document to plain object
                    authorNickname: authorNickname // Attach nickname
                };
            });

            res.status(200).render('categoryPosts', { posts: postsWithNicknames, title: categoryName + ' posts' });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error fetching posts for this category');
        });

};


