var mysql = require('mysql');

// https://github.com/mysqljs/mysql#pooling-connections
// change to pooled as drops connection

var pool = mysql.createPool({
	  host: "localhost",
	  user: "root",
	  password: "raja2417",
	  database: "mpmfdb"
});


pool.getConnection(function(err, connection) {
  // no release here?, see below
  if(!err) {
    console.log("Database is connected");
  } else {
    console.log("Error while connecting to database");
    //throw err; throw it??
  }
});

/*
con.connect(function(err) {
	if (err) throw err;
		console.log("Connected to Database...");
});
*/

module.exports = pool;