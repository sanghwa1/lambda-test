var express = require('express');
var router = express.Router();


router.get('/:mediaCode', function(req, res, next) {
  res.send('thumbnail');
});

module.exports = router;
