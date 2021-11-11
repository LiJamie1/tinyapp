const express = require("express");
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
// const cookie = require('cookie-parser');
const cookie = require('cookie-session');
const PORT = 8080;
const app = express();

app.set('view engine', 'ejs');
app.use(cookie({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(bodyParser.urlencoded({extended: true}));

//helper functions
const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};

const findUserByEmail = (email) => {
  for (const user in users) {
    const currUser = users[user];
    if (currUser.email === email) {
      return currUser;
    }
  }
  return null;
};

const userUrls = (id, urlDatabase) => {
  let urls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
};

// objects
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"},
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID"}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
  "userRandomID2": {
    id: "userRandomID2",
    email: "user2@example.com",
    password: "qwe"
  }
};

// gets

app.get("/", (req, res) => {
  //returns user id
  const user = req.session.userId;
  
  if (user) {
    res.redirect("/urls");
    return
  }

  res.redirect("/login");
});

app.get('/urls', (req, res) => {
  const templateVars = {
    user_id: null,
    email: null,
    urls: null
  };
  
  if (req.session.userId) {
    const user = users[req.session.userId];
    if (user) {
      const userUrlList = userUrls(user.id, urlDatabase);
      templateVars.user_id = user.id;
      templateVars.email = user.email;
      templateVars.urls = userUrlList;
      res.render('urls_index', templateVars);
      return
    }
  }

  res.render('urls_index', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {
    user_id: req.session.userId,
  };
  res.render('urls_login', templateVars);
});

app.get('/urls/new', (req, res) => {
  const user = req.session.userId;
  if (!user) {
    res.redirect("/login");
    return
  }
  const templateVars = {
    user_id: user,
    email: users[user].email
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.session.userId,
  };
  res.render('urls_register', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    user_id: req.session.userId,
    email: users[req.session.userId].email,
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL
  };
  res.render('urls_show', templateVars);
});

app.get("/register", (req, res) => {
  res.redirect("/register");
  return
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
  return
});

//post

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  
  if(!userEmail || !userPassword) {
    res.status(400).send('Email or Password is missing')
    return
  }

  const user = findUserByEmail(userEmail);

  if(!user) {
    res.status(400).send('Email does not exist')
    return;
  }

  bcrypt.compare(userPassword, user.password, (err, success) => {
    if(!success) {
      res.status(400).send('Password is incorrect');
      return 
    }
    req.session.userId = user.id;
    res.redirect("/urls");
    return
  });
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.userId;
  urlDatabase[shortURL] = {longURL, userID};
  res.redirect(`urls/${shortURL}`);
  return
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.userId;
  const shortURL = req.params.shortURL;
  const userUrlList = userUrls(userId, urlDatabase);

  if (userUrlList[shortURL]) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
    return
  }
  res.status(403).send("You do not have access to delete or edit this link")
  return
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  const userId = req.session.userId;
  const userUrlList = userUrls(userId, urlDatabase);
  if (userUrlList[shortURL]) {
    urlDatabase[shortURL] = {longURL: newLongURL, userID: userId};

    res.redirect("/urls");
    return
  }
  res.status(403).send("You do not have access to delete or edit this link");
  return
});

app.post("/logout", (req, res) => {
  req.session = null
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;

  if (!email || !password) {
    res.status(400).send('Email or Password is missing');
    return
  }
  
  const user = findUserByEmail(email)
  if (user) {
    res.status(400).send('Email already in use');
    return
  }

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      const id = generateRandomString();

      users[id] = {
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