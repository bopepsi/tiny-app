const urlDatabase = require('./model/urlDatabase');
const users = require('./model/user');
const tracker = require('./model/tracker');
const signupChecker = require('./helper/signup_check')

const express = require('express');
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');

const path = require('path');
const app = express();
const port = 8080;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//todo set cookies/sessionCookie into res.locals
app.use((req, res, next) => {
    if (req.session['user_id'] !== '' || !req.session['user_id']) {
        for (let key in users) {
            if (key === req.session['user_id']) {
                res.locals.useremail = users[key]['email'];
                res.locals.isAuth = true;
            };
        }
    }
    next();
});

app.get("/", (req, res) => {
    res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get('/register', (req, res) => {
    res.render('user_registration');
});

app.post('/register', (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    let msg = signupChecker(email, password);
    if(msg){
        return res.render('user_registration', { warning: msg })
    }
    let userId = generateRandomString();
    users[userId] = {};
    users[userId]['id'] = userId;
    users[userId]['email'] = email;
    users[userId]['password'] = hashedPassword;
    req.session.user_id = userId;
    return res.redirect('/');
});

app.get('/login', (req, res) => {
    res.render('user_login');
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    for (var key in users) {
        if (users[key]['email'] === email) {
            const passwordCorrect = bcrypt.compareSync(password, users[key]['password'])
            if (passwordCorrect) {
                console.log('login info matches')
                let user_id = key;
                req.session.user_id = user_id;
                return res.redirect('/');
            } else {
                const warning = 'please check your credentials';
                return res.render('user_login', { msg: warning, originEmail: email });
            }
        }
    };

    const warning = 'user doesn\'t exisit';
    return res.render('user_login', { msg: warning, originEmail: email });
});

app.post('/logout', (req, res) => {
    req.session = null;
    // res.clearCookie('user_id');
    res.redirect('/');
});

app.get('/urls', (req, res) => {
    const userId = req.session['user_id'];
    let userURLs = {};
    for (let key in urlDatabase) {
        if (urlDatabase[key]['userId'] === userId) {
            userURLs[key] = urlDatabase[key].longURL;
        }
    }
    res.render('urls_index', { urls: userURLs });
});

//todo  -   Override method
app.delete('/urls/:shortURL/delete', (req, res) => {
    if (!res.locals.isAuth) {
        return res.redirect('/login');
    }
    const url = req.params.shortURL;
    delete urlDatabase[`${url}`];
    res.redirect('/urls');
});

app.post('/urls', (req, res) => {
    if (!res.locals.isAuth) {
        return res.redirect('/login');
    }
    const longURL = req.body.longURL;
    let str = generateRandomString();
    const userId = req.session['user_id'];
    urlDatabase[`${str}`] = {
        longURL: longURL,
        userId: userId
    }
    res.redirect(`/urls/`);
});

app.get("/urls/new", (req, res) => {
    if (!res.locals.isAuth) {
        return res.redirect('/login');
    }
    res.render("urls_new");
});

app.get('/urls/:shortURL', (req, res) => {
    if (!urlDatabase[req.params.shortURL]) {
        return res.render('404');
    };
    const id = req.params.shortURL;
    if (tracker[id]) {
        tracker[id] = { ...tracker[id] }
    } else {
        tracker[id] = {};
    }

    tracker[id]['counter'] = (tracker[id]['counter'] ? tracker[id]['counter'] : 0) + 1;
    tracker[id]['uniqueVisit'] = 1;
    if (req.session.user_id) {
        tracker[id]['users'] = [...(tracker[id]['users'] ? tracker[id]['users'] : [])];
        tracker[id]['users'].push({ user: req.session.user_id, timestamp: new Date().toDateString() });

    } else {
        tracker[id]['users'] = [...(tracker[id]['users'] ? tracker[id]['users'] : [])];
        req.session.temp_id = generateRandomString();
        tracker[id]['users'].push({ user: req.session.temp_id, timestamp: new Date().toDateString() });
    }
    res.render('urls_detail', { shortURL: id, longURL: urlDatabase[id]['longURL'] });
});

app.get('/urls/:shortURL/edit', (req, res) => {
    if (!res.locals.isAuth) {
        return res.redirect('/login');
    }
    const counter = tracker[req.params.shortURL]['counter'];
    const users = tracker[req.params.shortURL]['users'];
    let uniqueVisit = 0;
    let helper = [];
    for (let item of users) {
        if (!helper.includes(item['user'])) {
            helper.push(item['user']);
            uniqueVisit++;
        }
    }
    const id = req.params.shortURL;
    res.render('urls_show', { shortURL: id, longURL: urlDatabase[id]['longURL'], visitCount: counter, visitors: users, uniqueVisitCount: uniqueVisit });
});

app.post('/urls/:shortURL', (req, res) => {
    if (!res.locals.isAuth) {
        return res.redirect('/login');
    };
    urlDatabase[req.params.shortURL] = req.body.newURL;
    res.redirect('/');
});

app.get("/u/:shortURL", (req, res) => {
    if (!urlDatabase[req.params.shortURL]) {
        return res.render('404');
    }
    const longURL = urlDatabase[req.params.shortURL]['longURL'];
    res.redirect(longURL);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/400', (req, res) => {
    res.status(400).render('400');
});

//todo handle 404 errors
app.use((req, res) => {
    res.status(404).render('404');
})

//todo generate unique id
function generateRandomString() {
    let arr = [];
    let ans = '';
    for (let i = 65; i <= 90; i++) {
        arr.push(String.fromCharCode(i));
    };
    for (let i = 97; i <= 122; i++) {
        arr.push(String.fromCharCode(i));
    };
    for (let i = 48; i <= 57; i++) {
        arr.push(String.fromCharCode(i));
    };
    for (let i = 0; i < 6; i++) {
        let charIdx = Math.floor(Math.random() * arr.length);
        ans += arr[charIdx];
    };
    return ans;
};

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});