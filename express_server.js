const express = require("express");
const { request } = require("http");
const { v4: uuid } = require('uuid');
const cookieParser = require("cookie-parser");
const app = express();

const PORT = 8080; // default port 8080
function generateRandomString() {
  let x = uuid()
  return x.substring(0, 6);
}
app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  
  let key = generateRandomString();
  urlDatabase[key] = req.body["longURL"];
  // Log the POST request body to the console
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]/* What goes here? */ };
  res.render("urls_show", templateVars);
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

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)  
  console.log(req.body.username)
  res.redirect("/urls");
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.post("/urls/:username/delete", (req, res) => {
  console.log("delete")

  const id = req.params.id
  delete urlDatabase[id]
  res.redirect("/urls")
});



// const templateVars = {
//   username: req.cookies["username"],
//   // ... any other vars
// };
// res.render("urls_index", templateVars);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
