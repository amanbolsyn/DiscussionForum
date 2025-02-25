const User = require('../models/user');
const jwt = require('jsonwebtoken');

//for 2F sign up
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const dotenv = require('dotenv');
//load environment vars
dotenv.config();


const transporter = nodemailer.createTransport({
    service: "Gmail",
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});


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

    //console.log(refreshToken)

    return { accessToken, refreshToken };
};
//auth controllers
module.exports.signup_get = (req, res) => {
    res.render('signup', { title: 'Signup' });
};

module.exports.login_get = (req, res) => {
    res.render('login', { title: 'Login' });
};


// Store temporary user info (use a more permanent solution for production)
let tempUserData = {};

module.exports.signup_post = async (req, res) => {
    const { nickname, email, password } = req.body;

    try {

         // Check if the email is already registered
         const existingUser = await User.findOne({ email });
         if (existingUser) {
             return res.status(400).json({ errors: { email: 'Email is already registered' } });
         }
         
        // Generate a random 2FA code
        const twoFactorCode = crypto.randomBytes(3).toString('hex'); // Generates a 6-digit hex code

        // Store the user's information and the 2FA code temporarily
        tempUserData = {
            nickname,
            email,
            password,
            twoFactorCode,
            twoFactorCodeExpiry: Date.now() + 15 * 60 * 1000 // Code expires in 15 minutes
        };

        // Send the 2FA code to the user's email
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Your 2FA Code for Account Creation',
            text: `Your 2FA code is: ${twoFactorCode}. This code will expire in 15 minutes.`
        };

        transporter.sendMail(mailOptions, async (err, info) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: 'Email does not exist' });
            }

            // Return a response asking the user to verify the 2FA code
            res.status(200).json({ isSent: true });

        });
    } catch (err) {
        console.log(err.message, err.code);
        const errors = HandleErrors(err);
        res.status(400).json({ errors });
    }
};

// New route to handle the verification of the 2FA code
module.exports.verify_2fa_post = async (req, res) => {
    const twoFactorCode = req.body.authCode;

    console.log(req.body)
    console.log(twoFactorCode)

    try {
        // Ensure the 2FA code is valid and has not expired
        if (
            tempUserData.twoFactorCode === twoFactorCode &&
            Date.now() < tempUserData.twoFactorCodeExpiry
        ) {
            // Code is valid, proceed with creating the user in the database

            const { nickname, email, password } = tempUserData;

            // Create the user in the database
            const user = await User.create({ nickname, email, password });

            // Clear the temporary user data
            tempUserData = {};

            // Create tokens
            const { accessToken, refreshToken } = CreateTokens(user._id);

            // Save the refresh token in the database
            user.refreshToken = refreshToken;
            await user.save();

            // Set the tokens as cookies
            res.cookie('jwt', accessToken, { httpOnly: true, maxAge: 1000 * 60 * 60 }); // 1 hour
            res.cookie('refresh-token', refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 });

            // Return success message
            res.status(200).redirect('posts');
        } else {
            // Invalid or expired 2FA code
            res.status(400).json({ message: 'Invalid or expired 2FA code.' });
        }
    } catch (err) {
        console.log(err.message, err.code);
        res.status(500).json({ message: 'Server error.' });
    }
};


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

