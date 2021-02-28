var pool = require('./connection');

// return a Promise to allow promise async functionality
// using pooled connections
module.exports = {
	execute: async function(sql){ 
		return new Promise(function(resolve, reject) {
			pool.getConnection(function(err, connection) {
				connection.query(sql, function(err, result){
				connection.release();
				if (err)
					reject(err);
				else
					resolve(result);
				});
			});
		});
	}
}
