const User = require('../models/user');


module.exports.profile_get = (req, res) => {

    const id = req.params.id;
    console.log(id)

    User.findById(id)
        .then((result) => {
            res.status(200).render('profile', { user: result, title: 'User' })
        })
        .catch((err) => {
            console.log(err);
        })
}
