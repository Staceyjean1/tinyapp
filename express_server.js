const express = require("express");
const { request } = require("http");
const { v4: uuid } = require('uuid');
const cookieParser = require("cookie-parser");
const app = express();
const morgan = require('morgan');
const morganMiddleware = morgan('dev');

const PORT = 8080; // default port 8080
function generateRandomString() {
  let x = uuid()
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


app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morganMiddleware);
app.get("/urls", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"],
    urls: urlDatabase
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {

  let key = generateRandomString();
  urlDatabase[key] = req.body["longURL"];
  // Log the POST request body to the console
  // res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
  

});
// app.get("/urls/new", (req, res) => {
//   const templateVars = {
//     user: req.cookies["user_id"],
//     urls: urlDatabase
//   };
//   res.render("urls_new", templateVars);
// });

// app.post("/user_ID", (req, res) => {

//   let key = generateRandomString();
//   urlDatabase[key] = req.body["longURL"];
//   // Log the POST request body to the console
//   res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
// });
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"],
    urls: urlDatabase
  };
  console.log(templateVars.user)
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.render("login");
  }
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
  if (!user) {
    res.redirect("/youShallNotPass");
  }
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
})

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});


app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});


// Post-register user_id
app.post("/register", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const id = generateRandomString();

  // const user = {id, email, password}
  users[id] = {
    id,
    email,
    password,
  }
  if (!email || !password) {
    return res.status(400).send('Provide an email AND a password');
  }
  // if (!user_id) {
  //   // if they don't, respond with an error message
  //   return res.status(401).send('You must have a cookie to see this page');
  // }

  // if (foundUser) {
  //   return res.status(400).send('email is already in use');
  // }
  // if (!user_id) {
  //   return res.status(403).send('email cannot be found ');
  // }
  // if (foundUser.password !== password) {
  //   return res.status(400).send('passwords do not match');
  // }
  res.cookie("user_id", id);
  console.log(users);
  return res.redirect("/urls");
});

app.get("/register", (req, res) => {
  let user = req.cookies["user_id"];
  // get user from cookies
  // if user exists, redirect to /urls else render login page
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("register");
  }
});

// if email and password params match an existing user:
// sets a cookie
// redirects to /urls
// if email and password params don't match an existing user:
// returns HTML with a relevant error message
app.post("/login", (req, res) => {
  console.log(users);
  let email = req.body.email
  const password = req.body.password
  let foundUser = null;

  for (var user_id of Object.keys(users)) {
    var user_temp = users[user_id]
    var email_temp = user_temp.email
    console.log(email_temp);
    if (email_temp == email) {
      foundUser = user_temp;
    }
  }

  if (!foundUser) {
    return res.status(403).send('Email cannot be found');
  }
  if (foundUser.password !== password) {
    return res.status(403).send('Incorrect password');
  }
  res.cookie("user_id", foundUser.id)

  res.redirect("/urls");
});

app.get("/login/", (req, res) => {
  let user = req.cookies["user_id"];
  // get user from cookies
  // if user exists, redirect to /urls else render login page
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("login");
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});


app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  console.log(res);
  console.log("cookie")
  res.render("login");
});

app.get('/logout', (req, res) => {
  res.render('login');
});

app.post("/urls/:user/delete", (req, res) => {
  console.log("delete")

  const id = req.params.id
  delete urlDatabase[id]
  res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});