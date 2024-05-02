const express = require('express');
const path = require('path');
const app = express();
app.set("view engine", "ejs");
app.set('views', './views');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/main", (req, res) =>  res.render("main"));

app.use('/upload-url', require('./routes/upload'));
app.use('/transcoding', require('./routes/transcoding'));
app.use('/thumbnails', require('./routes/thumbnail'));
app.use('/videos', require('./routes/video'));

module.exports = app;
