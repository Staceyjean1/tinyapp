const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuid } = require('uuid');
const cookieSession = require('cookie-session');
const app = express();
const morgan = require('morgan');
const morganMiddleware = morgan('dev');
const bcrypt = require("bcryptjs");
const PORT = 8080; // default port 8080
// const { emailExists } = require('.views/helpers.js');

function emailExists(email, object) {
  for (const user in object) {
    if (object[user].email === email) {
      return true;
    }
  }
  return false;
};

function checkPassword(password) {
  return true;
};



function generateRandomString() {
  let x = uuid();
  return x.substring(0, 6);
};

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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morganMiddleware);

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});


app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.session.user_id
  };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.session.user_id,
  };
  res.render("urls_index", templateVars);
});


// app.get("/urls/new", (req, res) => {
//   const templateVars = {
//     user: req.session.user_id,
//   };
//   console.log(templateVars.user)
//   if (templateVars.user) {
//     res.render("urls_new", templateVars);
//   } else {
//     res.redirect("login");
//   }
// });

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
app.get('/login', (req, res) => {
  res.render('login', { user: req.session.user });
});


// app.get("/login", (req, res) => {
//   const user = req.session.user_id;
//   if (user) {
//     res.redirect("/urls");
//   } else if (req.session.user_id === null) {
//     res.redirect("/login");
//   }
// });




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
  if (!req.session.user_id) {
    // User is not logged in, return an error message
    return res.status(401).send("You must be logged in to create a new URL.");
  }
  let key = generateRandomString();
  urlDatabase[key] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${key}`);
});



// app.post("/urls", (req, res) => {

//   let key = generateRandomString();
//   urlDatabase[key] = {
//     longURL: req.body.longURL,
//     userID: req.session.user_id
//   };
//   res.redirect(`/urls/${key}`);
// });
// app.post("/register", (req, res) => {
//   const email = req.body.email;
//   const password = req.body.password;
//   const userID = generateRandomString();

//   if (!email || !password) {
//     res.status(400).send("Please enter both an email and password");
//   } else if (emailExists(email)) {
//     res.status(400).send("An account with this email already exists");
//   } else {
//     users[userID] = {
//       id: userID,
//       email: email,
//       password: bcrypt.hashSync(password, 10)
//     };
//     req.session.user_id = userID;
//     res.redirect("/urls");
//   }
// });


app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!checkPassword(password)) {
    return res.status(400).send("Invalid password");
  }

  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: email,
    password: bcrypt.hashSync(password, 10)
  }

  req.session.user_id = userID;
  res.redirect("/urls");
});

// app.post("/login", (req, res) => {
//   // Extract email and password from request body
//   const email = req.body.email;
//   const password = req.body.password;

//   // Check if email exists in the 'users' object
//   if (emailExists(email, users)) {
//     // If email exists, check if password is correct
//     if (checkPassword(email, password, users)) {
//       // If password is correct, create a session for the user
//       req.session.user_id = getUserID(email, users);
//       res.redirect("/urls");
//     } else {
//       // If password is incorrect, send an error message
//       res.status(403).send("Error: Incorrect email or password");
//     }
//   } else {
//     // If email does not exist, send an error message
//     res.status(403).send("Error: Incorrect email or password");
//   }
// });

app.post("/login", (req, res) => {
  // Check if the email and password match a user in the database
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      console.log(err);
      res.status(500).send();
    } else if (!user) {
      res.status(403).send();
    } else {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        // Set the user object in the session
        req.session.user = user;
        res.redirect("/urls");
      } else {
        res.status(403).send();
      }
    }
  });
});




app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
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
