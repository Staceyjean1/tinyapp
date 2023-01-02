const express = require("express");
const { request } = require("http");
const { v4: uuid } = require('uuid');
const cookieSession = require('cookie-session');
const app = express();
const morgan = require('morgan');
const morganMiddleware = morgan('dev');
const bcrypt = require("bcryptjs");
const PORT = 8080; // default port 8080

function generateRandomString() {
  let x = uuid();
  return x.substring(0, 6);
}

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "123",
  },
};
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  },
};

const urlsForUser = (userID, database) => {
  let userURLs = {};
  for (const url in database) {
    if (database[url].userID === userID) {
      userURLs[url] = database[url].longURL
    }
  }
  return userURLs;
};

app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ["mysecret", "othersecret"],


  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use(morganMiddleware);

app.get("/urls", (req, res) => {
  const templateVars = {
    user: req.session.user_id,
    urls: urlDatabase
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.session.user_id,
  };
  console.log(templateVars.user)
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("login");
  }
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: req.session.user_id,
  };
  if (!req.session.user_id) {
    console.error("You must have a cookie to see this page");
    return res.redirect('/protected');
  }
  res.render("urls_show", templateVars);


});

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});


app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});


// app.get("/login", (req, res) => {

//   const user = req.session.user_id;
//     if (user) {
//       res.redirect("/urls") {
//        } else { if (req.session.user === null) {
//         res.redirect("/login");

//           res.redirect("/login");
//           // res.redirect("/urls");

//       }
//     } else {
//       const templateVars = {
//         user: null
//       }
//       res.render("login", templateVars);
//     }
//   });

app.get("/login", (req, res) => {
  const user = req.session.user_id;
  if (user) {
    res.redirect("/urls");
  } else if (req.session.user_id === null) {
    res.redirect("/login");
  }
});



app.get("/register", (req, res) => {
  // const user = req.cookies["user_id"]
  const user = req.session.user_id
  // if user exists, redirect to /urls else render login page
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: null
    }
    res.render("register", templateVars);
  }
});





app.post("/urls", (req, res) => {

  let key = generateRandomString();
  urlDatabase[key] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${key}`);
});



app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('Provide an email AND a password');
  };

  const id = generateRandomString();
  const hash = bcrypt.hashSync(password, 10);


  users[id] = {
    id,
    email,
    password: hash,
  };


  console.log(users);
  // res.cookie("user_id", id);
  req.session.user_id = id
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  console.log(users);
  let email = req.body.email;
  const password = req.body.password;
  let foundUser = null;

  for (const user_id of Object.keys(users)) {
    const user_temp = users[user_id];
    const email_temp = user_temp.email;
    console.log(email_temp);
    if (email_temp == email) {
      foundUser = user_temp;
    }
  }

  if (!foundUser) {
    return res.status(403).send('Email cannot be found');
  }
  if (!bcrypt.compareSync(password, foundUser.password)) {
    return res.status(403).send('Incorrect password');
  }
  req.session.user_id = foundUser.id;
  res.redirect("/urls");
});




app.post('/logout', (req, res) => {
  req.session = null;

  res.redirect("/login");
});


app.post("/urls/:shortURL/update", (req, res) => {
  const id = req.params.shortURL;
  const user = req.session.user_id;
  const userUrls = Object.keys(urlsForUser(user, urlDatabase));
  if (userUrls.includes(id)) {
    urlDatabase[id] = { longURL: req.body.newURL, userID: user };
    return res.redirect("/urls");
  }
  res.status(401).send("You are not authorized");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
