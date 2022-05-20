const users = require('../model/user');
const tracker = require('../model/tracker');
const generateId = require('./generateId');

//? check if user exists, email and password cannot be null
//? return proper message if either one of them occur
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

//? initialize a tracker object for that shortURL when it was created.
const initTracker = (str) => {
    tracker[str] = {};
    tracker[str]['users'] = [];
    tracker[str]['counter'] = 0;
}

//? updateTracker object for that particular shortURL when people use it.
const updateTracker = (req,id) => {
    tracker[id]['counter'] = (tracker[id]['counter'] ? tracker[id]['counter'] : 0) + 1;
    tracker[id]['uniqueVisit'] = 1;
    if (req.session.user_id) {
        tracker[id]['users'] = [...(tracker[id]['users'] ? tracker[id]['users'] : [])];
        tracker[id]['users'].push({ user: req.session.user_id, timestamp: new Date().toDateString() });

    } else {
        tracker[id]['users'] = [...(tracker[id]['users'] ? tracker[id]['users'] : [])];
        req.session.temp_id = generateId();
        tracker[id]['users'].push({ user: req.session.temp_id, timestamp: new Date().toDateString() });
    }
}

const uniqueVisitCounter = (id) => {
    const users = tracker[id]['users'];
    let uniqueVisit = 0;
    let helper = [];
    for (let item of users) {
        if (!helper.includes(item['user'])) {
            helper.push(item['user']);
            uniqueVisit++;
        }
    }
    return uniqueVisit;
}

const registerUser = (userId)=>{
    users[userId] = {};
    users[userId]['id'] = userId;
    users[userId]['email'] = email;
    users[userId]['password'] = hashedPassword;
}

module.exports = {
    signupChecker,
    uniqueVisitCounter,
    initTracker,
    updateTracker,
    registerUser
};