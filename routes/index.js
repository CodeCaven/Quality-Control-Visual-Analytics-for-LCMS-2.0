var express = require('express');
var router = express.Router();

// Require controller modules.
var home_controller = require('../controllers/DEV-indexController');

// Routes
router.get('/', home_controller.home);

module.exports = router;

/* GET home page. 
router.get('/', function(req, res, next) {
	//res.redirect('/metabolomics');
  res.render('index');
  //res.send("To implement landing page");
});
*/

