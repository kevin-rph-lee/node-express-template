// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";
const express    = require("express");
const bodyParser = require("body-parser");
const sass       = require("node-sass-middleware");
const app        = express();
const morgan     = require('morgan');
const bcrypt = require('bcrypt');
const cookieSession = require("cookie-session");

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000,
}));

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/users", usersRoutes(db, bcrypt, cookieSession));
// Note: mount other resources here, using the same pattern above


// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.get("/", (req, res) => {

  let queryStringGetUser = `SELECT username, id FROM USERS WHERE username = $1;`
  let valuesGetUser =  [req.session.username]

  //Checks if user exists first. Throws error if already exists, if not create new user in DB. 
  db.query(queryStringGetUser, valuesGetUser)
    .then(data => {
      let user;
      if(req.session.username === undefined){
        user = {id: null, username: null};
        res.render("index", {user});
      } else if(data['rowCount'] === 0){
        res.status(500).send('Internal Database Error! Please contact your system administrator')
      } else {
        user = {id: data['rows'][0]['id'], username: data['rows'][0]['username']}
        res.render("index", {user});
      }
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
