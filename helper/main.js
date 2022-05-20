const users = require('../model/user');
const tracker = require('../model/tracker');
const generateId = require('./generateId');

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

const initTracker = (str) => {
    tracker[str] = {};
    tracker[str]['users'] = [];
    tracker[str]['counter'] = 0;
}

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

module.exports = {
    signupChecker,
    uniqueVisitCounter,
    initTracker,
    updateTracker
};