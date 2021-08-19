const { Pool } = require('pg');
const bcrypt = require('bcrypt');

require('dotenv').config();

//Loading DB setup parameters
const dbParams = require('../lib/db.js');
const db = new Pool(dbParams);

db.connect();

let SQLStringInsertSeeds = `INSERT INTO users(username, password, role) 
                            VALUES($1, $2, $3), ($4, $5, $6), ($7, $8, $9), ($10, $11, $12);`

//Creating 4 users from the env file
let valuesInsertSeeds =  ['admin@admin.com', bcrypt.hashSync(process.env.ADMIN_PASS, 10), 1, 
                          'user1@user.com', bcrypt.hashSync(process.env.USER1_PASS, 10), 2,
                          'user2@user.com', bcrypt.hashSync(process.env.USER2_PASS, 10), 2,
                          'user3@user.com', bcrypt.hashSync(process.env.USER3_PASS, 10), 2]

db.query(SQLStringInsertSeeds, valuesInsertSeeds)
.then(data => {
    console.log('Done! CTRL + C to exit')
    db.end();
    return;
})
.catch(err => {
  console.log('ERROR: ')
  console.log(err)
});