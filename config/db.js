//Please update your database info here
var mysql = require("mysql")
var db_config = {
	host	: 'sql8.freesqldatabase.com',
	user	: 'sql8189956',
	password: 'XzNwbfAThg',
	database: 'sql8189956'
}

var connection
	connection = mysql.createConnection(db_config)
	connection.connect(function (err) {
		if(err){
			console.log('DB_ERROR_OCCURED: Please enable your database first')
		}
	})

module.exports = connection