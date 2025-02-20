const User = require('../models/user');


module.exports.profile_get = (req, res) => {

    const id = req.params.id;

    User.findById(id)
        .then((result) => {
            res.status(200).render('profile', { user: result, title: 'Profile ' + result.nickname })
        })
        .catch((err) => {
            console.log(err);
        })
}
