const User = require('../models/user');
const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');
//load environment vars
dotenv.config();



//handle auth errors 
const HandleErrors = (err) => {
    // console.log(err.message, err.code);
    let errors = { nickname: '', email: '', password: '' };


    // incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'That email is not registered';
    }

    // incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'That password is incorrect';
    }

    //duplicat error code
    if (err.code === 11000) {
        errors.email = "That email is already registered";
        return errors;
    }

    //validation errors 
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {//gets values of an object without it keys
            errors[properties.path] = properties.message; //updating "error" object with different error messages
        });
    }

    return errors;
}


//crate token 
const maxAge = 1000 * 60 * 10;

// Generate access and refresh tokens
const CreateTokens = (id) => {
    const accessToken = jwt.sign({ id }, process.env.KEY, {
        expiresIn: '10m', // Access token expires in 10 minutes
    });

    const refreshToken = jwt.sign({ id }, process.env.REFRESH_KEY, {
        expiresIn: '7d', // Refresh token expires in 7 days
    });

    console.log(refreshToken)

    return { accessToken, refreshToken };
};
//auth controllers
module.exports.signup_get = (req, res) => {
    res.render('signup');
    console.log("Opened sign up page")
};

module.exports.login_get = (req, res) => {
    res.render('login');
    console.log("Opened login page")
};

module.exports.signup_post = async (req, res) => {
    const { nickname, email, password } = req.body;

    console.log("create a new user")

    try {
        const user = await User.create({ nickname, email, password });//storing new user in db by passing an object

        // Check if the user already has a refresh token, and if so, invalidate it
        if (user.refreshToken) {
            // Optionally, you could delete the previous refresh token, or update it
            user.refreshToken = null; // Remove old refresh token
            await user.save();
        }

        // Create new tokens
        const { accessToken, refreshToken } = CreateTokens(user._id);

        // Save the refresh token in the database
        user.refreshToken = refreshToken;
        await user.save();

        // Set the access token in a cookie or return it directly
        res.cookie('jwt', accessToken, { httpOnly: true, maxAge });
        res.cookie('refresh-token', refreshToken, { httpOnly: true, maxAge: maxAge });
        res.status(200).json({ user: user._id });


    } catch (err) {  //throws an error if user wasn't saved successfully 
        console.log(err.message, err.code);
        const errors = HandleErrors(err);
        res.status(400).json({ errors });
    }
}


module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;

    try {

        const user = await User.login(email, password);
        // Check if the user already has a refresh token, and if so, invalidate it
        if (user.refreshToken) {
            // Optionally, you could delete the previous refresh token, or update it
            user.refreshToken = null; // Remove old refresh token
            await user.save();
        }

        // Create new tokens
        const { accessToken, refreshToken } = CreateTokens(user._id);

        // Save the refresh token in the database
        user.refreshToken = refreshToken;
        await user.save();

        // Set the access token in a cookie or return it directly
        res.cookie('jwt', accessToken, { httpOnly: true, maxAge });
        res.cookie('refresh-token', refreshToken, { httpOnly: true, maxAge: maxAge });

        // Return the refresh token in the response
        res.status(200).json({ user: user._id, refreshToken });

    } catch (err) {
        const errors = HandleErrors(err);
        res.status(400).json({ errors });
    }
};

module.exports.logout_get = async (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.cookie('refresh-token', '', { maxAge: 1 });
    res.redirect('/');
};

