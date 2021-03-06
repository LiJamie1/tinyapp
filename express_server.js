const express = require("express");
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const {generateRandomString, findUserByEmail, userUrls, urlExists} = require('./helpers');
const {urlDatabase, userDatabase} = require('./database');
const cookie = require('cookie-session');
const PORT = 8080;
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookie({
  name: 'session',
  keys: ['key1', 'key2']
}));

// gets

app.get("/", (req, res) => {
  //returns user id
  const user = req.session.userId;
  
  if (user) {
    return res.redirect("/urls");
  }

  res.redirect("/login");
});

app.get('/urls', (req, res) => {
  const templateVars = {
    user_id: null,
    email: null,
    urls: null
  };
  
  const user = req.session.userId;
  
  if (user) {
    const currUser = userDatabase[user];
    const userUrlList = userUrls(currUser.id, urlDatabase);
    templateVars.user_id = currUser.id;
    templateVars.email = currUser.email;
    templateVars.urls = userUrlList;
    return res.render('urls_index', templateVars);
  }

  res.render('urls_index', templateVars);
});

app.get('/login', (req, res) => {
  const user_id = req.session.userId;
  res.render('urls_login', {user_id});
});

app.get('/urls/new', (req, res) => {
  const user = req.session.userId;
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = {
    user_id: user,
    email: userDatabase[user].email
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const user = req.session.userId;

  if (user) {
    return res.redirect("/urls");
  }

  res.render('urls_register', {user_id: user});
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const user = req.session.userId;

  if (!user) {
    return res.status(400).send("You are not logged in, sign in <a href='/login'>here</a>");
  }

  if (!urlExists(shortURL, urlDatabase)) {
    return res.status(400).send("Url does not exist, make a short url <a href='/urls/new'>here</a>");
  }

  const userUrlList = userUrls(user, urlDatabase);

  if (!userUrlList[shortURL]) {
    return res.status(400).send("You do not own this url, make a short url <a href='/urls/new'>here</a>");
  }

  const templateVars = {
    user_id: user,
    email: userDatabase[user].email,
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL
  };
  
  res.render('urls_show', templateVars);
});

app.get("/register", (req, res) => {
  const user = req.session.userId;

  if (user) {
    return res.redirect("/urls");
  }

  res.redirect("/register");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (!urlExists(shortURL, urlDatabase)) {
    return res.status(400).send("Url does not exist, make a short url <a href='/urls/new'>here</a>");
  }
  
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//post

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  
  if (!userEmail || !userPassword) {
    return res.status(400).send('Email or Password is missing. If you do not have an account register <a href="/register">here</a>');
  }

  const user = findUserByEmail(userEmail, userDatabase);

  if (!user) {
    return res.status(400).send('Email does not exist, please register for an account <a href="/register">here</a>');
  }

  bcrypt.compare(userPassword, user.password, (err, success) => {
    if (!success) {
      return res.status(400).send('Email or Password is incorrect');
    }
    req.session.userId = user.id;
    res.redirect("/urls");
  });
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.userId;

  urlDatabase[shortURL] = {longURL, userID};
  res.redirect(`urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.userId;
  const shortURL = req.params.shortURL;
  const userUrlList = userUrls(userId, urlDatabase);

  if (userUrlList[shortURL]) {
    delete urlDatabase[shortURL];
    return res.redirect("/urls");
  }

  res.status(403).send("You do not have access to delete or edit this link");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  const userId = req.session.userId;
  const userUrlList = userUrls(userId, urlDatabase);

  if (userUrlList[shortURL]) {
    urlDatabase[shortURL] = {longURL: newLongURL, userID: userId};
    return res.redirect("/urls");
  }

  res.status(403).send("You do not have access to delete or edit this link, if this is your link please <a href='/login'>login</a>");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;

  if (!email || !password) {
    
    return res.status(400).send('Email or Password is missing');
  }
  
  const user = findUserByEmail(email, userDatabase);
  if (user) {
    return res.status(400).send('Email already in use');
  }

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      const id = generateRandomString();

      userDatabase[id] = {
        id,
        email,
        password: hash
      };

      req.session.userId = id;
      
      res.redirect("/urls");
    });
  });
});

//listening

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});