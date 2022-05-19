const users = require('../model/user');

const signupChecker = (email, password) => {

    let msg;

    if (!email || !password) {
        msg = 'email or password cannot be empty'
    };
    for (var key in users) {
        if (users[key]['email'] === email) {
            msg = 'user already exist'
        }
    };

    return msg;

}

module.exports = signupChecker;