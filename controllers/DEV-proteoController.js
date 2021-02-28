var async = require('async');
var db = require('../models/metabDB');
let colormap = require('colormap');
const colorbrewer = require('colorbrewer');

// Get data for Proteomics Charts
exports.proteo_home = function(req, res) {
    console.log(req.query.machine);
    console.log(req.query.experiment);
    console.log(req.query.metric);
    res.send("To implement Proteomics...");
};