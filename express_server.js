const express = require("express");
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cookie = require('cookie-parser');
const PORT = 8080;
const app = express();

app.use(cookie());
app.set('view engine', 'ejs');
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

const authenticateUser = (email, password) => {
  const currentUser = findUserByEmail(email);

  if (!currentUser) {
    //email doesnt exist
    return {error: "Email does not exist", data: null};
  }
  if (currentUser.password !== password) {
    //password or email does not match
    return {error: "Password is incorrect", data: null};
  }
  
  return {data: currentUser, error: null};
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
  const user = req.cookies.user_id;
  
  if (user) {
    res.redirect("/urls");
  }

  res.redirect("/login");
});

app.get('/urls', (req, res) => {
  const templateVars = {
    user_id: null,
    email: null,
    urls: null
  };
  
  if (req.cookies.user_id) {
    const user = users[req.cookies.user_id];
    const userUrlList = userUrls(user.id, urlDatabase);
    templateVars.user_id = user.id;
    templateVars.email = user.email;
    templateVars.urls = userUrlList;
    res.render('urls_index', templateVars);
  }

  res.render('urls_index', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {
    user_id: req.cookies.user_id,
  };
  res.render('urls_login', templateVars);
});

app.get('/urls/new', (req, res) => {
  const user = req.cookies.user_id;
  if (!user) {
    res.redirect("/login");
  }
  const templateVars = {
    user_id: user,
    email: users[user].email
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
    email: users[req.cookies.user_id].email,
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL
  };
  res.render('urls_show', templateVars);
});

app.get("/register", (req, res) => {
  res.redirect("/register");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//post

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const {error, data} = authenticateUser(userEmail, userPassword);

  if (error) {
    console.log(error);
    return res.status(400).send("email or password is incorrect");
  }

  res.cookie("user_id", data.id);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.cookies.user_id;
  urlDatabase[shortURL] = {longURL, userID};
  res.redirect(`urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.cookies.user_id;
  const shortURL = req.params.shortURL;
  const userUrlList = userUrls(userId, urlDatabase);

  if (userUrlList[shortURL]) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }

  return res.status(403).send("You do not have access to delete or edit this link");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  const userId = req.cookies.user_id;
  const userUrlList = userUrls(userId, urlDatabase);
  if (userUrlList[shortURL]) {
    urlDatabase[shortURL] = newLongURL;
    res.redirect("/urls");
  }

  return res.status(403).send("You do not have access to delete or edit this link");
  // res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;

  if (!email || !password) {
    return res.status(400).send('Email or Password is missing');
  }
  
  if (findUserByEmail(email)) {
    return res.status(409).send('Email already in use');
  }

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      const id = generateRandomString();

      users[id] = {
        id,
        email,
        password: hash
      };

      res.cookie('user_id', id);

      res.redirect("/urls");
    });
  });
});

//listening

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});