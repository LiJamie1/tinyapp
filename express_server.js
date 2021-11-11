const express = require("express");
const bodyParser = require('body-parser');
const cookie = require('cookie-parser');
const PORT = 8080;
const app = express();
app.use(cookie())
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

//helper functions
const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

// objects
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "qwertyuiop"
  },
  "userRandomID2": {
    id: "userRandomID2",
    email: "user2@example.com",
    password: "asdfghjkl"
  }
}

// gets

app.get("/", (req, res) => {
  res.redirect("/urls")
});

app.get('/urls', (req, res) => {
  const templateVars = {
    user_id: null,
    email: null,
    urls: urlDatabase
  };

  if (req.cookies.user_id) {
    const user = users[req.cookies.user_id]
    // console.log('req.cookies', req.cookies)
    templateVars.user_id = user.id
    templateVars.email = user.email
    res.render('urls_index', templateVars);
  };

  res.render('urls_index', templateVars)
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    user_id: req.cookies.user_id,
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.cookies.user_id,
  };
  res.render('urls_register', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    user_id: req.cookies.user_id,
    shortURL: shortURL, longURL: urlDatabase[shortURL]
  };
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});

//post

app.post("/login", (req, res) => {
  const user = users[req.body.username]
  res.cookie('user_id', user.id)
  res.redirect("/urls")
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL
  res.redirect(`urls/${shortURL}`)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect("/urls")
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls")
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const password = req.body.password
  const email = req.body.email

  if ( email === '' || password === '') {
    res.status(400).send('Email or Password is missing')
  }

  users[id] = {
    id,
    email,
    password
  };
  
  res.cookie('user_id', id)
  
  res.redirect("/urls")
});

//listening

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});