const session = require('express-session');

require("dotenv").config();


module.exports = session({
    secret: process.env.SECRET_KEY || '',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
});
