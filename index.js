const express = require('express');
const path = require("path");
const fs = require("fs");
const bodyParser = require('body-parser');
const Validator = require('./classes/Validator'); //data validation
const dbClass = require('./classes/DB'); //class to connect to the database
const bcrypt = require('bcrypt'); //for hashing passwords
const saltRounds = 15;
const session = require('express-session');

//functions
const currentTime = require('./functions/currentTime'); //current date as a string
const isLoggedIn = require('./functions/isLoggedIn'); //check if user is logged in

const app = express();
const PORT = 3000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ 'secret': 'something', 'resave': true, 'saveUninitialized': true })); //session settings
app.set('view engine', 'ejs');
app.use(express.static('public')); //publicly avaible

//assigning session variables to local ones to be available in the template engine
app.use(function (req, res, next) {
  res.locals.user = {};
  if (isLoggedIn(req)) {
    res.locals.user = {
      username: req.session.username,
      email: req.session.email,
      userId: req.session.userId
    }
  }
  next();
});

//mongo

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";
const DB = new dbClass(MongoClient, url); //instance used to connect to the database

//basic routes
const indexRoute = require('./basic_routes/index');
app.get('/', indexRoute);

//automatically loading routes from the routes folder

let routesPath = path.join(__dirname, "basic_routes");
fs.readdirSync(routesPath).forEach(
  (route) => {
    if (route != "index.js") app.get("/" + route.split(".")[0], require("./basic_routes/" + route));
  });

//special routes (used for login, registration etc.)

const routeLogin = require('./routes/post/login');
const routeRegister = require('./routes/post/register');
const routeNewentry = require('./routes/post/newentry');
const routeEditentry = require('./routes/post/editentry');

const routeJournal = require('./routes/get/journal');
const routeLogout = require('./routes/get/logout');
const routeRemove = require('./routes/get/remove');


//login to the site
app.post('/login', (req, res) => {
  routeLogin(req, res, DB, bcrypt);
});

//registration of a new account
app.post('/register', (req, res) => {
  routeRegister(req, res, DB, bcrypt, validator);
});

//add new entry to the journal
app.post('/newentry', (req, res) => {
  routeNewentry(req, res, DB, Validator, isLoggedIn);
});

//edit an existing journal entry
app.post('/editentry/:id', (req, res) => {
  routeEditentry(req, res, DB, Validator);
});

app.get('/journal', (req, res) => {
  if (isLoggedIn(req)) {
    DB.findAll("journal", { userId: req.session.userId }, (result) => {
      let query = {};
      if (req.query.err) query.errors = req.query.err;
      if (req.query.msg == "removed") query.message = "Entry removed";
      else if (req.query.msg == "added") query.message = "New entry added";
      else if (req.query.msg == "edited") query.message = "Entry edited";
      if (result.length > 0) query.posts = result.reverse();
      res.render('journal', query);
    });
  }
  else res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy((error) => {
    if (error) return error;
    res.redirect('/');
  });
});

app.get('/remove/:id', (req, res) => {
  if (isLoggedIn(req)) //if logged in
  {
    let id = parseInt(req.params.id);
    if (id) //if id is int
    {
      DB.find("journal", { id: id }, (result) => {
        if (result.userId == req.session.userId) //if user has permission to delete
        {
          DB.remove("journal", result, (results) => {
            res.redirect('/journal/?msg=removed');
          });
        }
      });
    }
    else res.redirect('/');
  }
  else {
    res.redirect('/');
  }
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));