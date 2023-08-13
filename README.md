# cineflix

A RESTful Node API with Express &amp; MongoDB, based on a [Procademy](https://www.youtube.com/playlist?list=PL1BztTYDF-QPdTvgsjf8HOwO4ZVl_LhxS) course titled ["A Complete NODE JS Course Step by Step"](https://www.youtube.com/playlist?list=PL1BztTYDF-QPdTvgsjf8HOwO4ZVl_LhxS) by [@manojjha86](https://github.com/manojjha86/NODE-JS)

[Cineflix RESTful API Postman Documentation](https://documenter.getpostman.com/view/28810590/2s9Xy5MAY7)

Get Started:

- Fork and/or clone this repo
- Create `config.env` file: (see example below)
  - Set UP Email Service: I used [mailtrap](https://mailtrap.io/) to test this app in my local environment.
  - Create Mongo DB: I used [Mongo DB](https://www.mongodb.com/) to build and run this app
- Install Dependancies: `npm i`
  - Add Movies to Mongo DB: `node ./data/import-dev-data.js`
- Start Development Mode: `npm start`
- Start Production Mode: `npm run start_prod`

Example `config.env` file needed to run this repo:

```
NODE_ENV=development
NODE_PORT=3000
MONGO_CONN_STR=mongodb+srv://[username]:[password]@[mongodb cluster params]
LOCAL_MONGO_CONN_STR=mongodb://localhost:2717/ceneflix
JWT_SECRET_STR='[jwt secret string]'
CINEFLIX_LOGIN_EXPIRES=10000000
EMAIL_USER=[username]
EMAIL_PASSWORD=[password]
EMAIL_HOST=[host address]
EMAIL_PORT=[port]
```
