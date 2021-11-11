const express = require("express");
const bodyParser = require('body-parser');
const cookie = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.use(cookie())

const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.redirect("/urls")
});

app.get('/urls', (req, res) => {
  const templateVars = {
    username: req.cookies.username,
    urls: urlDatabase
  };
  
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies.username,
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies.username,
  };
  res.render('urls_register', templateVars);
});

app.post("/login", (req, res) => {
  const username = req.body.username  
  res.cookie('username', username)
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
  res.clearCookie("username")
  res.redirect("/urls")
});

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

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const password = req.body.password
  const email = req.body.email
  //add new object to users
  //object should include id, email and password
  //id is randomly generated
  users[id] = {
    id,
    email,
    password
  };
  //set a user_id cookie containing newly generated id
  res.cookie(id, users[id])
  res.redirect("/urls")
})



app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    username: req.cookies.username,
    shortURL: shortURL, longURL: urlDatabase[shortURL]
  };
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

