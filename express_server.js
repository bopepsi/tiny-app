const express = require('express');
const path = require('path')
const app = express();
const port = 8080;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
    const tempVars = { urls: urlDatabase };
    res.render('urls_index', tempVars);
})

app.get('/urls/:shortURL', (req, res) => {
    const id = req.params.shortURL;
    console.log(id);
    const tempVars = { shortURL: id, longURL: urlDatabase[id] };
    console.log(tempVars);
    res.render('urls_show', tempVars);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
})