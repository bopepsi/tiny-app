const urlDatabase = {
    "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userId: 'bplmrg'
    },
    "9sm5xK": {
        longURL: "http://www.google.com",
        userId: 'bplmrg'
    },
};

const users = {
    bplmrg: { id: 'bplmrg', email: 'bopepsi@gmail.com', password: '1111' },
    manman: { id: 'manman', email: 'offline@gmail.com', password: '1111' },
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
    if (req.cookies['user_id'] !== '' || !req.cookies['user_id']) {
        for (let key in users) {
            if (key === req.cookies['user_id']) {
                res.locals.useremail = users[key]['email'];
                res.locals.isAuth = true;
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
        if (users[key]['email'] === email) {
            console.log('email already exist')
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

app.get('/login', (req, res) => {
    res.render('user_login');
})

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    for (var key in users) {
        if (users[key]['email'] === email) {
            if (users[key]['password'] === password) {
                console.log('login info matches')
                let user_id = key;
                res.cookie('user_id', user_id);
                return res.redirect('/');
            } else {
                const warning = 'please check your credentials';
                return res.render('user_login', { msg: warning, originEmail: email });
            }
        }
    };
    
    const warning = 'user doesn\'t exisit';
    return res.render('user_login', { msg: warning, originEmail: email });
})

app.post('/logout', (req, res) => {
    res.clearCookie('user_id');
    res.redirect('/');
})

app.get('/urls', (req, res) => {
    const userId = req.cookies['user_id'];
    let userURLs = {};
    for (let key in urlDatabase) {
        if (urlDatabase[key]['userId'] === userId) {
            userURLs[key] = urlDatabase[key].longURL;
        }
    }
    res.render('urls_index', { urls: userURLs });
});

app.post('/urls/:shortURL/delete', (req, res) => {
    if (!res.locals.isAuth) {
        return res.redirect('/login');
    }
    const url = req.params.shortURL;
    console.log(url);
    delete urlDatabase[`${url}`];
    res.redirect('/urls');
})

app.post('/urls', (req, res) => {
    const longURL = req.body.longURL;
    let str = generateRandomString();
    const userId = req.cookies['user_id'];
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
    const id = req.params.shortURL;
    res.render('urls_detail', { shortURL: id, longURL: urlDatabase[id]['longURL'] });
});

app.get('/urls/:shortURL/edit', (req, res) => {
    if (!res.locals.isAuth) {
        return res.redirect('/login');
    }
    const id = req.params.shortURL;
    res.render('urls_show', { shortURL: id, longURL: urlDatabase[id]['longURL'] });
});

app.post('/urls/:shortURL', (req, res) => {
    if (!res.locals.isAuth) {
        return res.redirect('/login');
    }
    urlDatabase[req.params.shortURL] = req.body.newURL;
    res.redirect('/');
})

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL]['longURL'];
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