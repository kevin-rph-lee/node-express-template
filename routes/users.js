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

  //Accessing the admin page that views all of the users in the system
  router.get('/admin', (req, res) => {

    //Validating if the user is logged in
    let user = getUserData(req)

    let SQLStringGetUser = `SELECT userName, id, role FROM USERS`

    db.query(SQLStringGetUser)
      .then(data => {
        //Checking if the user is an admin (roleID = 1)
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

  //Returns information for a single user. 
  router.get('/:id', (req, res) => {
    //Validating if the requesting user is logged in 
    let user= getUserData(req)

    let SQLStringGetUser = `SELECT userName, id, role FROM USERS WHERE id = $1;`
    let valuesGetUser =  [req.params.id]

    db.query(SQLStringGetUser, valuesGetUser)
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

  //Creating a new user
  router.post('/new', (req, res) => {
    
    const username = req.body.username.trim().toLowerCase().toString();
    const password = bcrypt.hashSync(req.body.password, 10)

    //Checking if the email is valid
    if (!validateEmail(username)){
      res.status(500).send('Invalid email!')
    }

    //Query strings for DB
    let SQLStringInsertUser = `INSERT INTO users(
      username, password, role
      ) VALUES($1, $2, false) RETURNING id;`
    let valuesInsertUser =  [username, password]
    let SQLStringCheckUser = `SELECT username FROM USERS WHERE username = $1;`
    let valuesCheckUser =  [username]

    //Checks if user exists first. Throws error if already exists, if not create new user in DB and log them in.
    db.query(SQLStringCheckUser, valuesCheckUser)
      .then(data => {
        if(data['rowCount'] > 0){
          res.status(500).send('User already exists!')
        } else {
          db.query(SQLStringInsertUser, valuesInsertUser)
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

  //Route for when user edits their own password
  router.post('/:id/edit', (req, res) => {
    const userID = req.params.id
    const currentPassword = req.body.currentPassword
    const newPassword = req.body.newPassword
    const hashNewPassword = bcrypt.hashSync(newPassword, 10)

    let user = getUserData(req);

    let SQLStringCheckUser = `SELECT id, username, password, role FROM USERS WHERE id = $1;`
    let valuesCheckUser =  [userID]

    //Query strings for DB
    let SQLStringUpdateUserPass = `UPDATE users SET password = $1 WHERE id = $2;`
    let valuesUpdateUserPass =  [hashNewPassword, userID]

    //Checking if the user making the request is the same person who is logged in (preventing from changing someone ELSE's password)
    if(req.params.id == user['id']){

      db.query(SQLStringCheckUser, valuesCheckUser)
      .then(data => {
        if((data['rowCount'] != 1)) {
          res.status(500).send('Internal Database Error! Please contact your system administrator')
        } else if(bcrypt.compareSync(currentPassword, data['rows'][0]['password'])){
          db.query(SQLStringUpdateUserPass, valuesUpdateUserPass)
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

  //Route for when an admin updates the password of another user
  router.post('/:id/admin/edit', (req, res) => {
    const selectedUserID = req.params.id
    const currentPassword = req.body.currentPassword
    const newPassword = req.body.newPassword
    const hashNewPassword = bcrypt.hashSync(newPassword, 10)
    let user = getUserData(req);

    //Getting the role of the user hitting this route
    let SQLStringCheckAdminPass = `SELECT id, username, password, role FROM USERS WHERE id = $1;`
    let valuesCheckAdminPass =  [user['id'] ]

    //Update SQL string to update the other users password
    let SQLStringUpdateUserPass = `UPDATE users SET password = $1 WHERE id = $2;`
    let valuesUpdateUserPass =  [hashNewPassword, selectedUserID]

    db.query(SQLStringCheckAdminPass, valuesCheckAdminPass)
    .then(data => {
      //Checking if the role ID of the requestor is 1 (admin). If not, deny the rquest. 
      //If rold ID = 1, then checks the password of the requestor to ensure if it's correct. After ensuring it's correct, then update the password. 
      if((data['rowCount'] != 1)) {
        res.status(500).send('Internal Database Error! Please contact your system administrator')
      } else if(bcrypt.compareSync(currentPassword, data['rows'][0]['password'])){
        db.query(SQLStringUpdateUserPass, valuesUpdateUserPass)
        .then(data => {    
          res.status(200).send('Password update successful')
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });    
      } else {
        res.status(500).send('Incorrect Password')
      }
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });    
  });

  //Logging in the user
  router.post('/login', (req, res) => {
    const username = req.body.username.trim().toLowerCase().toString();
    const password = req.body.password

    //Checking if the email is valid
    if (!validateEmail(username)){
      res.status(500).send('Invalid email!')
    }

    //Query strings for DB
    let SQLStringCheckUser = `SELECT id, username, password, role FROM USERS WHERE username = $1;`
    let valuesCheckUser =  [username]

    //Checks if the user exists, if it does, checks if password is correct. If correct, sets a cookie session in the browser and logs the user in. 
    db.query(SQLStringCheckUser, valuesCheckUser)
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

  router.post("/logout", (req, res) => {
    req.session = null;
    res.sendStatus(200);
  });


  return router;
};
