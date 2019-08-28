const express = require('express');
const path = require("path");
const fs = require("fs");
const bodyParser = require('body-parser');
const Validator = require('./classes/Validator');
const dbClass = require('./classes/DB');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(express.static('public'));

//mongo

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";
const DB = new dbClass(MongoClient, url);

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

app.post('/register', (req, res) => {
  let validator = new Validator();
  validator.set(req.body.username);
  validator.minLength(4);
  validator.maxLength(30);
  let usernameErrors = validator.errors;
  validator.set(req.body.password);
  validator.minLength(8);
  validator.maxLength(50);
  let passwordErrors = validator.errors;
  validator.set(req.body.email);
  validator.minLength(5);
  validator.maxLength(40);
  validator.isEmail();
  let emailErrors = validator.errors;
  validator.set(req.body.passwordRepeat);
  validator.passwordEqual(req.body.password);
  let passwordRepeatErrors = validator.errors;
  DB.exists("journalusers", { "email": req.body.email }, (result) => { //callback to check if email is already used
    if(result) emailErrors = "The email is already used"; //if there is email in database
    if (!usernameErrors && !passwordErrors && !emailErrors && !passwordRepeatErrors) {
      let obj = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
      }
      DB.addElement("journalusers", "journaluserid", obj, () => {
        console.log("OK!");
      });
    }
    else res.render('register', {
      username: req.body.username, 
      password: req.body.password, 
      email: req.body.email,
      usernameErrors: usernameErrors, 
      passwordErrors: passwordErrors,
      emailErrors: emailErrors,
      passwordRepeatErrors: passwordRepeatErrors
    });

  });

});


app.listen(PORT, () => console.log(`Listening on ${PORT}`));