# Node Express Webapp Template

A basic template for web applications using Node/Express with a Postgres database.

![](https://raw.githubusercontent.com/kevin-rph-lee/node-express-template/master/1.JPG)

## Features

### Basic user management

Users held within a PostgreSQL DB and authentication managed using Cookie-Session. Ability to login/logout and register new users. Users either have a role 1 (Admin) or 2 (regular user)

Users who login can update their own password and view some basic information about their account. 

![](https://raw.githubusercontent.com/kevin-rph-lee/node-express-template/master/2.JPG)

### User Administration Dashboard

If logged in as an Admin, they can reset the password of other users.

![](https://raw.githubusercontent.com/kevin-rph-lee/node-express-template/master/3.JPG)

![](https://raw.githubusercontent.com/kevin-rph-lee/node-express-template/master/4.JPG)

## Getting Started

```
npm install
npm start
npm run db:reset
npm run db:seed
open http://localhost:8080
```

The *npm run db:reset* command will drop application DB tables and rebuild them (removing any data) based off bin/resetdb.js.

The *npm run db:seedusers* command will rerun the seed data file within bin/seed.js and password data from the .env file

If deployed to Heroku environment, the lib/db.js file will recognize that the DATABASE_URL config var that is automatically created by Heroku and will connect using that instead. 

## Dependencies

- Node 10.x or above
- NPM 5.x or above
- PG 6.x

## Contact

- Email: Kevin.rph.lee@gmail.com