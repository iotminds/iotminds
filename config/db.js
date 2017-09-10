//Please update your database info here
var mysql = require("mysql")
var db_config = {
	host	: 'p1us8ottbqwio8hv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
	user	: 'cpfj0qoqkan4uwgq',
	password: '1997.piogex7okldf7qaz',
	database: 'iotminds'
}

var connection
	connection = mysql.createConnection(db_config)
	connection.connect(function (err) {
		if(err){
			console.log('DB_ERROR_OCCURED: Please enable your database first')
		}
	})

module.exports = connection