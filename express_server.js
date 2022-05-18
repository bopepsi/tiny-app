const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com",
};

const users = {
};

const express = require('express');
var cookieParser = require('cookie-parser')
const path = require('path')
const app = express();
const port = 8080;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//todo set cookies into res.locals
app.use((req, res, next) => {
    if (req.cookies['username'] !== '' || !req.cookies['username']) {
        res.locals.username = req.cookies['username'];
    };
    if (req.cookies['user_id'] !== '' || !req.cookies['user_id']) {
        for (let key in users) {
            if (key === req.cookies['user_id']) {
                res.locals.useremail = users[key]['email'];
            };
        }
    }
    next();
})



app.get("/", (req, res) => {
    res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get('/register', (req, res) => {
    res.render('user_registration');
})

app.post('/register', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        return res.redirect('/400');
    };
    for (var key in users) {
        console.log('infor', users[key])
        if (users[key]['email'] === email) {
            console.log('matches email')
            return res.redirect('/400');
        }
    };
    let userId = generateRandomString();
    users[userId] = {};
    users[userId]['id'] = userId;
    users[userId]['email'] = email;
    users[userId]['password'] = password;
    console.log(users);
    res.cookie('user_id', userId);

    res.redirect('/');
})

app.post('/login', (req, res) => {
    let username = req.body.username;
    console.log(username)
    res.cookie('username', username);
    res.redirect('/')
});

app.post('/logout', (req, res) => {
    res.clearCookie('user_id');
    res.redirect('/');
})

app.get('/urls', (req, res) => {
    const name = req.cookies["username"];
    res.render('urls_index', { urls: urlDatabase, username: name });
});

app.post('/urls/:shortURL/delete', (req, res) => {
    const url = req.params.shortURL;
    console.log(url);
    delete urlDatabase[`${url}`];
    res.redirect('/urls');
})

app.post('/urls', (req, res) => {
    const longURL = req.body.longURL;
    let str = generateRandomString();
    urlDatabase[`${str}`] = longURL;
    res.redirect(`urls/${str}`);

});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.get('/urls/:shortURL', (req, res) => {
    const id = req.params.shortURL;
    res.render('urls_show', { shortURL: id, longURL: urlDatabase[id] });
});

app.post('/urls/:shortURL', (req, res) => {
    urlDatabase[req.params.shortURL] = req.body.newURL;
    res.redirect('/');
})

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/400', (req, res) => {
    res.status(400).render('400');
})

console.log(users);

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
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
})