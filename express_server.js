const express = require("express");
const { v4: uuid } = require('uuid');
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

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log('request body', req.body["longURL"]);
  console.log('generate random string', generateRandomString());
  let key = generateRandomString();
  urlDatabase[key] = req.body["longURL"];
  console.log('urlDatabase', urlDatabase);// Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: b2xVn2/* What goes here? */ };
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



app.post("/urls/:id/delete", (req, res) => {
  console.log("delete")

  const id = req.params.id
  delete urlDatabase[id]
  res.redirect("/urls")
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

