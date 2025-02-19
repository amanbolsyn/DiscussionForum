const Post = require('../models/post');
const User = require('../models/user');

const jwt = require('jsonwebtoken');

const {LogToFile} = require('../logs/logger');

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
    LogToFile('New request was made: ' + 'STATUS CODE: ' + res.statusCode + ' HOST: ' + req.hostname + ' PATH: ' + req.path + ' METHOD: ' + req.method);

}

//shows all posts on a home page
module.exports.posts_get = (req, res) => {
    //automatically infers content type
    //automatically infers status code

    //display all post on a main page
    Post.find()
        .then((result) => {
            res.status(200).render('home', { posts: result });
            LogToFile('New request was made: ' + 'STATUS CODE: ' + res.statusCode + ' HOST: ' + req.hostname + ' PATH: ' + req.path + ' METHOD: ' + req.method);
        })
        .catch((err) => {
            LogToFile('New request was made: ' + ' Error occured ' + err + ' STATUS CODE: ' + res.statusCode + ' HOST: ' + req.hostname + ' PATH: ' + req.path + ' METHOD: ' + req.method);
        })

}

module.exports.post_get = (req, res) => {
    const id = req.params.id;

    Post.findById(id)
        .then((result) => {
            res.status(200).render('post', { post: result, title: 'Post' })
            LogToFile('New request was made: ' + 'STATUS CODE: ' + res.statusCode + ' HOST: ' + req.hostname + ' PATH: ' + req.path + ' METHOD: ' + req.method);
        })
        .catch((err) => {
            LogToFile('New request was made: ' + ' Error occured ' + err + ' STATUS CODE: ' + res.statusCode + ' HOST: ' + req.hostname + ' PATH: ' + req.path + ' METHOD: ' + req.method);

        })
}


module.exports.post_post = async (req, res) => {
    const post = new Post(req.body);

    const accessToken = req.cookies['jwt']; // Accessing 'jwt' from cookies
    // Decode the refresh token to get the user ID
    const decoded = jwt.verify(accessToken, process.env.KEY);
    const id = decoded.id;

    // Find the user in the database
    const user = await User.findById(id);
    console.log(user);
    post.author = id

    post.save()
        .then((result) => {
            // Send SMS after saving the post
            const messageBody = `A new post has been created: ${result.title}`;
            const recipientPhoneNumber = "+77021345823"; // Phone number to receive the SMS (can be admin or user)

            client.messages.create({
                to: recipientPhoneNumber, // Recipient's phone number
                from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
                body: messageBody, // Message content
            })
                .then((message) => {
                    //console.log('SMS sent successfully:', message.sid);
                    res.redirect('/posts'); // Redirect to posts list after sending SMS
                    LogToFile('New request was made: ' + 'STATUS CODE: ' + res.statusCode + ' HOST: ' + req.hostname + ' PATH: ' + req.path + ' METHOD: ' + req.method);

                })
                .catch((err) => {
                    res.status(500).send('Error occurred while sending SMS.');
                    LogToFile('New request was made: ' + ' Failed to send SMS: ' + err + ' STATUS CODE: ' + res.statusCode + ' HOST: ' + req.hostname + ' PATH: ' + req.path + ' METHOD: ' + req.method);

                });
        })
        .catch((err) => {
            LogToFile('New request was made: ' + ' Error occured: ' + err + ' STATUS CODE: ' + res.statusCode + ' HOST: ' + req.hostname + ' PATH: ' + req.path + ' METHOD: ' + req.method);
            res.status(500).send('Error occurred while saving the post.');

        });

};


module.exports.posts_delete = (req, res) => {
    const id = req.params.id;

    //deletes record by id and deletes it 
    Post.findByIdAndDelete(id)
        .then((result) => {
            res.staus(200).json({ redirect: '/posts' })
            LogToFile('New request was made: ' + 'STATUS CODE: ' + res.statusCode + ' HOST: ' + req.hostname + ' PATH: ' + req.path + ' METHOD: ' + req.method);
        })
        .catch((err) => {
            LogToFile('New request was made: ' + ' Error occured: ' + err + ' STATUS CODE: ' + res.statusCode + ' HOST: ' + req.hostname + ' PATH: ' + req.path + ' METHOD: ' + req.method);

        })
};

module.exports.post_delete = (req, res) => {
    const id = req.params.id;

    //deletes record by id and deletes it 
    Post.findByIdAndDelete(id)
        .then((result) => {
            res.status(200).json({ redirect: '/posts' })
            LogToFile('New request was made: ' + 'STATUS CODE: ' + res.statusCode + ' HOST: ' + req.hostname + ' PATH: ' + req.path + ' METHOD: ' + req.method);
        })
        .catch((err) => {
            LogToFile('New request was made: ' + ' Error occured: ' + err + ' STATUS CODE: ' + res.statusCode + ' HOST: ' + req.hostname + ' PATH: ' + req.path + ' METHOD: ' + req.method);

        })
};

//renders new posts page
module.exports.newPosts_get = (req, res) => {
    res.status(200).render('newPosts');
    LogToFile('New request was made: ' + 'STATUS CODE: ' + res.statusCode + ' HOST: ' + req.hostname + ' PATH: ' + req.path + ' METHOD: ' + req.method);

};

//renders popular posts page
module.exports.popularPosts_get = (req, res) => {
    res.status(200).render('popularPosts');
    LogToFile('New request was made: ' + 'STATUS CODE: ' + res.statusCode + ' HOST: ' + req.hostname + ' PATH: ' + req.path + ' METHOD: ' + req.method);
};


