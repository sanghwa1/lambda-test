const express = require('express');
const app = express();
app.set("view engine", "ejs");
app.set('views', './views');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/main", (req, res) =>  res.render("main"));

app.use('/upload-url', require('./controller/upload'));
app.use('/transcoding', require('./controller/transcoding'));
app.use('/thumbnails', require('./controller/thumbnail'));
app.use('/videos', require('./controller/video'));

module.exports = app;
