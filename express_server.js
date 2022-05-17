const express = require('express');
const path = require('path')
const app = express();
const port = 8080;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
    res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
    const tempVars = { urls: urlDatabase };
    res.render('urls_index', tempVars);
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
    console.log(id);
    const tempVars = { shortURL: id, longURL: urlDatabase[id] };
    console.log(tempVars);
    res.render('urls_show', tempVars);
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