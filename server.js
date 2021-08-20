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

//Checks cookie session to see if someone is logged in. User object is passed down to EJS file. 
getUserData = (req) =>{
  let user = {}

  //Troubleshooting logging
  // console.log('ID ' + req.session.id)
  // console.log('UserName ' + req.session.userName)
  // console.log('Role ' + req.session.role)

  if((req.session.userName == undefined) || (req.session.userName == null)){
    // console.log('User not logged in')
    user = {id: null, 
            userName: null, 
            role: null};
    return user;
  } else {
    // console.log('User logged in')
    user = {userName:req.session.userName,
            id: req.session.id,
            role: req.session.role}
    return user
  }
}

// Separated Routes for each Resource
const usersRoutes = require("./routes/users");

// Resource routes
app.use("/users", usersRoutes(db, bcrypt, cookieSession, getUserData));

// Home page
app.get("/", (req, res) => {
  let user = getUserData(req)
  res.render("index", {user:user});
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
