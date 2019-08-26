const express = require('express');
const path = require("path");
const fs = require("fs");
const bodyParser = require('body-parser');
const Validator = require('./classes/Validator');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(express.static('public'));

//routes
const indexRoute = require('./routes/index');
app.get('/', indexRoute);

//automatically loading routes from the routes folder

let routesPath = path.join(__dirname, "routes");
fs.readdirSync(routesPath).forEach(
  (route) => {
    if (route != "index.js") app.get("/" + route.split(".")[0], require("./routes/" + route));
  });

//special routes

app.post('/login', (req, res) => {
  let validator = new Validator();
  validator.set(req.body.username);
  validator.minLength(4);
  validator.maxLength(30);
  let usernameErrors = validator.errors;
  validator.set(req.body.password);
  validator.minLength(8);
  validator.maxLength(50);
  let passwordErrors = validator.errors;
  if (!usernameErrors && !passwordErrors) {
    console.log("OK!");
  }
  else res.render('login', {username: req.body.username, password: req.body.password, usernameErrors: usernameErrors, passwordErrors: passwordErrors});
});



app.listen(PORT, () => console.log(`Listening on ${PORT}`));