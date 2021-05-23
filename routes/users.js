/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const { query } = require('express');
const express = require('express');
const router  = express.Router();

module.exports = (db, bcrypt, cookieSession) => {

  //Checks for valid email
  function validateEmail (email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  router.post("/new", (req, res) => {
    
    const username = req.body.username.trim().toLowerCase().toString();
    const password = bcrypt.hashSync(req.body.password, 10)

    //Checking if the email is valid
    if (!validateEmail(username)){
      res.status(500).json({error: 'Invalid email!'})
    }

    //Query strings for DB
    let queryStringInsertUser = `INSERT INTO users(
      username, password
      ) VALUES($1, $2);`
    let valuesInsertUser =  [username, password]

    let queryStringCheckUser = `SELECT username FROM USERS WHERE username = $1;`
    let valuesCheckUser =  [username]

    //Checks if user exists first. Throws error if already exists, if not create new user in DB. 
    db.query(queryStringCheckUser, valuesCheckUser)
      .then(data => {
        if(data['rowCount'] > 0){
          res.status(500).json({error:'User already exists!'})
        } else {
          db.query(queryStringInsertUser, valuesInsertUser)
          .then(data => {
            req.session.username=username
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

  router.post("/logout", (req, res) => {
    req.session = null;
    res.sendStatus(200);
  });


  return router;
};
