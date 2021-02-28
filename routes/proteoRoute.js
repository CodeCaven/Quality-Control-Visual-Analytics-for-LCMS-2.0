var express = require('express');
var router = express.Router();

// Require controller modules.
var proteo_controller = require('../controllers/DEV-proteoController');

// Routes
router.get('/', proteo_controller.proteo_home);

module.exports = router;