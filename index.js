const express = require('express');
const path = require("path");
const fs = require("fs");
const bodyParser = require('body-parser');
const Validator = require('./classes/Validator');
const dbClass = require('./classes/DB');
const bcrypt = require('bcrypt');
const saltRounds = 15;

const session = require('express-session')

const app = express();
const PORT = 3000;

function currentTime()
{
  let date = new Date();
  return date.toLocaleDateString()+" "+date.toLocaleTimeString();
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({'secret': 'anything123', 'resave' : true, 'saveUninitialized': true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(function(req, res, next) {
  res.locals.user = {};
  if(req.session.username && req.session.email)
  {
    res.locals.user.username = req.session.username ? req.session.username : null;
    res.locals.user.email = req.session.email ? req.session.email : null;
    res.locals.user.userId = req.session.userId ? req.session.userId : null;
  }

  next();
});

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
  DB.find("journalusers", {email: req.body.email}, (result) => {
    let errors = null;
    if(!result) errors = "Incorrect data";
    else if(!bcrypt.compareSync(req.body.password, result.password)) errors = "Wrong password";
    if (!errors) {
      console.log("Logged in");
      req.session.email = result.email;
      req.session.username = result.username;
      req.session.userId = result.id;
      res.redirect('/');
    }
    else res.render('login', {email: req.body.email, password: req.body.password, errors: errors});
  });
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
        password: bcrypt.hashSync(req.body.password, saltRounds),
        email: req.body.email
      }
      DB.addElement("journalusers", "journaluserid", obj, () => {
        res.render('login', {message: "Registration successful, you can log in to your new account", email: req.body.email});
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




app.post('/newentry', (req, res) => {

  if(req.session.username && req.session.email && req.session.id)
  {
    let validator = new Validator();
    validator.set(req.body.source);
    validator.minLength(30);
    validator.maxLength(1000);
    let errors = validator.errors;
    if (!errors) {
      let obj = {
        userId: req.session.userId,
        time: currentTime(),
        text: req.body.source
      };
      DB.addElement("journal", "journalid", obj, () => {
        res.redirect('journal/?msg=added');
      });
    }
    else res.redirect(`journal/?err=${errors}`);
  }
  else res.redirect("/");

});

app.get('/journal', (req, res) =>{
  if(req.session.username && req.session.email && req.session.userId){
    DB.findAll("journal", {userId: req.session.userId}, (result) => {
      let query = {};
      if(req.query.err) query.errors = req.query.err;
      if(req.query.msg == "removed") query.message = "Entry removed";
      else if(req.query.msg == "added") query.message = "New entry added";
      if(result.length > 0) query.posts = result.reverse();
      res.render('journal', query);
    });
  }
  else res.redirect('/'); 
});

app.get('/logout', (req, res) => {
  req.session.destroy((error) => {
    if(error) return error;
    res.redirect('/');
  });
});

app.get('/remove/:id', (req, res) => {
    if(req.session.username && req.session.email && req.session.userId) //if logged in
    {
      let id = parseInt(req.params.id);
      if(id) //if id is int
      {
        DB.find("journal", {id: id}, (result) => {
          if(result.userId == req.session.userId) //if user has permission to delete
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