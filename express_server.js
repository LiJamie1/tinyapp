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

const findUser = (email) => {
  for (const user in users) {
    const currUser = users[user]
    if (currUser.email === email) {
      console.log("currUser", currUser)
      return currUser
    }
  }
  return null
}

const authenticateUser = (email, password) => {
  const currentUser = findUser(email);

  if (!currentUser) {
    //email doesnt exist
    return {error: "Email does not exist", data: null}
  }
  if (currentUser.password !== password) {
    //password or email does not match
    return {error: "Password is incorrect", data: null}
  }
  
  return {data: currentUser, error: null}
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
    templateVars.user_id = user.id
    templateVars.email = user.email
    res.render('urls_index', templateVars);
  };

  res.render('urls_index', templateVars)
});

app.get('/login', (req, res) => {
  const templateVars = {
    user_id: req.cookies.user_id,
  };
  res.render('urls_login', templateVars)
})

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

app.get("/register", (req, res) => {
  res.redirect("/register")
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});



//post

app.post("/login", (req, res) => {
  const userEmail = req.body.email
  const userPassword = req.body.password
  console.log(userEmail, userPassword)
  const {error, data} = authenticateUser(userEmail, userPassword);
  console.log("existing",data)
  if (error) {
    console.log(error)
    return res.status(400).send("email or password is incorrect")
  }

  res.cookie("user_id", data.id)
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
  if (findUser(email)) {
    res.status(409).send('Email already in use')
  }

  users[id] = {
    id,
    email,
    password
  };
  
  res.cookie('user_id', id)
  console.log(users[id])
  res.redirect("/urls")
});

//listening

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});