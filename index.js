const express = require('express');
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

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




app.listen(PORT, () => console.log(`Listening on ${PORT}`));