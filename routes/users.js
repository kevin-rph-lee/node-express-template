/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const { query } = require('express');
const express = require('express');
const { restart } = require('nodemon');
const router  = express.Router();

module.exports = (db, bcrypt, cookieSession, getUserData) => {

  //Checks for valid email
  function validateEmail (email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  router.get("/admin", (req, res) => {
    let user= getUserData(req)

    let queryStringGetUser = `SELECT userName, id, role FROM USERS`

    db.query(queryStringGetUser)
      .then(data => {
        if(user['role'] == 1){
          res.render('user_admin', {user: user, rows: data['rows']});
        } else {
          res.status(403).send('Forbidden')
        }
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
    
  });

  router.get("/:id", (req, res) => {
    let user= getUserData(req)
    let queryStringGetUser = `SELECT userName, id, role FROM USERS WHERE id = $1;`
    let valuesGetUser =  [req.params.id]
    //Checks if user exists first. Throws error if already exists, if not create new user in DB. 
    db.query(queryStringGetUser, valuesGetUser)
      .then(data => {
        if(user['userName'] == undefined){
          res.status(403).send('Forbidden')
        } else if(data['rowCount'] === 0){
          res.status(500).send('Internal Database Error! Please contact your system administrator')
        } else if(parseInt(user['id']) != parseInt(data['rows'][0]['id'])){
          res.status(403).send('Forbidden')
        } else {
          res.render("user", {user:user});
        }
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });


  router.post("/new", (req, res) => {
    
    const username = req.body.username.trim().toLowerCase().toString();
    const password = bcrypt.hashSync(req.body.password, 10)

    //Checking if the email is valid
    if (!validateEmail(username)){
      res.status(500).send('Invalid email!')
    }

    //Query strings for DB
    let queryStringInsertUser = `INSERT INTO users(
      username, password, role
      ) VALUES($1, $2, false) RETURNING id;`
    let valuesInsertUser =  [username, password]

    let queryStringCheckUser = `SELECT username FROM USERS WHERE username = $1;`
    let valuesCheckUser =  [username]

    //Checks if user exists first. Throws error if already exists, if not create new user in DB. 
    db.query(queryStringCheckUser, valuesCheckUser)
      .then(data => {
        if(data['rowCount'] > 0){
          res.status(500).send('User already exists!')
        } else {
          db.query(queryStringInsertUser, valuesInsertUser)
          .then(data => {
            req.session.id = data['rows'][0]['id']
            req.session.username=username
            req.session.role = 2
            res.status(200).send('New user registration successful')
          })
          .catch(err => {
            res
              .status(500)
              .json({ error: err.message });
          });
        }
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });


  router.post("/:id/edit", (req, res) => {
    const userID = req.params.id
    const currentPassword = req.body.currentPassword
    const newPassword = req.body.newPassword
    const hashNewPassword = bcrypt.hashSync(newPassword, 10)

    let user = getUserData(req);

    let queryStringCheckUser = `SELECT id, username, password, role FROM USERS WHERE id = $1;`
    let valuesCheckUser =  [userID]

    //Query strings for DB
    let queryStringUpdateUserPass = `UPDATE users SET password = $1 WHERE id = $2;`
    let valuesUpdateUserPass =  [hashNewPassword, userID]


    if( req.params.id == user['id'] || user['role'] == 1){
      //Checks if user exists first. Throws error if already exists, if not create new user in DB. 
      db.query(queryStringCheckUser, valuesCheckUser)
      .then(data => {
        if((data['rowCount'] != 1)) {

          res.status(500).send('Internal Database Error! Please contact your system administrator')
        } else if(bcrypt.compareSync(currentPassword, data['rows'][0]['password'])){

          db.query(queryStringUpdateUserPass, valuesUpdateUserPass)
          .then(data => {
            res.status(200).send('Password update successful')
          })
          .catch(err => {
            res
              .status(500)
              .json({ error: err.message });
          });

        } else if(!bcrypt.compareSync(currentPassword, data['rows'][0]['password'])){
          res.status(500).send('Invalid username or password!')
        } else {
          res.status(500).send('Internal Error! Please contact your system administrator')
        }
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });    
    } else {
      res.status(500).send('Forbidden')
    }
  });

  
  router.post("/login", (req, res) => {
    const username = req.body.username.trim().toLowerCase().toString();
    const password = req.body.password

    //Checking if the email is valid
    if (!validateEmail(username)){
      res.status(500).send('Invalid email!')
    }

    //Query strings for DB
    let queryStringCheckUser = `SELECT id, username, password, role FROM USERS WHERE username = $1;`
    let valuesCheckUser =  [username]

    //Checks if user exists first. Throws error if already exists, if not create new user in DB. 
    db.query(queryStringCheckUser, valuesCheckUser)
      .then(data => {

        if(data['rowCount'] == 0){
          res.status(500).send('Invalid username or password!')
        } else if((data['rowCount'] > 1)) {
          res.status(500).send('Internal Database Error! Please contact your system administrator')
        } else if(bcrypt.compareSync(password, data['rows'][0]['password'])){
          req.session.userName = username
          req.session.id = data['rows'][0]['id']
          req.session.role = data['rows'][0]['role']
          res.status(200).send('Login successful')
        } else if(!bcrypt.compareSync(password, data['rows'][0]['password'])){
          res.status(500).send('Invalid username or password!')
        } else {
          res.status(500).send('Internal Error! Please contact your system administrator')
        }
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.post("/update", (req, res) => {

  });


  

  router.post("/logout", (req, res) => {
    req.session = null;
    res.sendStatus(200);
  });


  return router;
};
