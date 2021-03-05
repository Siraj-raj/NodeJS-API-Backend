'use strict';

require('rootpath')();

var bcrypt = require('bcrypt');
var User = require('app/user/user.model');

module.exports = {
    signin,
    signup,
    getAll,
    getById,
    update,
    _delete
};

function signin(req, username, password, done) {
    User.findOne({ 'email': username },
        function (err, user) {
            if (err)
                return done(err);
            if (!user) {
                return done(null, false, { 'message': 'The user with this credential does not exist.' });
            }
            if (!bcrypt.compareSync(password, user.password)) {
                return done(null, false, { 'message': 'Invalid Password.' });
            }
            return done(null, user);
        }
    );
}

function signup(req, username, password, done) {
    process.nextTick(() => {
        User.findOne({ 'email': username }, (err, user) => {
            if (err) {
                return done(null, false, { message: "There is an error in creating an user." });
            }
            if (user) {
                return done(null, false, { message: 'The user with this email is already existed.' });
            } else {
                var u = new User();

                u.email = username;
                u.password = bcrypt.hashSync(password, 10);
                u.name = req.param('name');

                u.save(function (err) {
                    if (err) {
                        return done(null, false, { message: 'There is an error in registering an user.' });
                    }
                    console.log('User Registration succesful');
                    return done(null, u);
                });
            }
        });
    });
}

async function getAll() {
    return await User.find().select('-password').sort({ "created_on": -1 });
}

async function getById(id) {
    return await User.findById(id).select('-password');
}

async function _delete(id) {
    return await User.findByIdAndRemove(id);
}

async function update(id, userParam) {
    let user = await User.findById(id);

    if (!user) throw 'User not found.';

    if (userParam.password) {
        userParam.password = bcrypt.hashSync(userParam.password, 10);
    }

    userParam.updated_on = Date.now();

    Object.assign(user, userParam);

    await user.save();
}


