const { Pool } = require('pg');

const bcrypt = require('bcrypt');
require('dotenv').config();


const dbParams = require('../lib/db.js');
const db = new Pool(dbParams);

db.connect();

let queryStringInsertSeeds = `INSERT INTO users(
    username, password, role) 
    VALUES($1, $2, 1),
    ($3, $4, 2),
    ($5, $6, 2),
    ($7, $8, 2);`
let valuesInsertSeeds =  ['admin@admin.com', bcrypt.hashSync(process.env.ADMIN_PASS, 10), 
'user1@user.com', bcrypt.hashSync(process.env.USER1_PASS, 10),
'user2@user.com', bcrypt.hashSync(process.env.USER2_PASS, 10),
'user3@user.com', bcrypt.hashSync(process.env.USER3_PASS, 10)]

db.query(queryStringInsertSeeds, valuesInsertSeeds)
.then(data => {
    console.log('Done!')
    db.end();
    return;
})
.catch(err => {
  console.log(err)
});