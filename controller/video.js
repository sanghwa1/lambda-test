var express = require('express');
var router = express.Router();


router.get('/:mediaCode', function(req, res, next) {
  res.send('videos');
});


router.get('/:mediaCode/play', function(req, res, next) {
  res.send('videos');
});


module.exports = router;
