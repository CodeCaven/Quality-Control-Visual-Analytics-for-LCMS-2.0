var express = require('express');
var router = express.Router();

// Require controller modules.
var metab_controller = require('../controllers/DEV-metabController');

// Routes
router.get('/', metab_controller.metab_home);

module.exports = router;