const express = require('express');
const mongoose = require('mongoose');
//export post and auth routes
const PostRoutes = require('./routes/PostRoutes');
const AuthRoutes = require('./routes/AuthRoutes');
const ProfileRoutes = require('./routes/ProfileRoutes');

const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

const logger = require('./logs/logger');

//load environment vars
dotenv.config();

//express app
const app = express();

//register view engine 
app.set('view engine', 'ejs')

//connect to mongoDB
const dbURI = process.env.DB_URL;
mongoose.connect(dbURI)
    .then((result) => {
        app.listen(process.env.PORT)
        //logging 
        logger.info('Server is running at port ' + process.env.PORT, { caller: __filename });
        logger.info('Database is successfully connected', { caller: __filename });
    })
    .catch((err) => logger.error('Error occured: ' + err, { filepath: __filename }))


//register view engine 
app.set('view engine', 'ejs')

//middlware and static files(images, styles)
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    logger.info('Request processed', { caller: __filename, hostname: req.hostname, method: req.method, path: req.path, status: res.statusCode});
    //explicitly say middlware that we finished and it may go on
    next();
});

app.use(PostRoutes);
app.use(AuthRoutes);
app.use(ProfileRoutes);

//404 page
app.use((req, res) => {
    res.status(404).render('404');
    logger.info('Request processed', { caller: __filename, hostname: req.hostname, method: req.method, path: req.path, status: res.statusCode});
});


// app.put('/posts/:id', (req, res) => {
//     const id = req.params.id; // Get the post ID from the URL
//     const { title, body } = req.body; // Get updated title and body from the request body

//     console.log(req.body)

//     // Find the post by ID and update it
//     Post.findByIdAndUpdate(id, { title, body }, { new: true })  // `new: true` returns the updated post
//         .then((updatedPost) => {
//             res.json({ result: updatedPost });
//         })
//         .catch((err) => {
//             console.log(err);
//             res.status(500).json({ message: 'Error updating post' });
//         });
// });


