var express = require('express');
var path = require('path');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/index', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
