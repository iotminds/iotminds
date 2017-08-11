//Please update your database info here
var mysql = require("mysql")
var db_config = {
	host	: '109.232.216.219',
	user	: 'serbestk_iot',
	password: 'i1997bt',
	database: 'serbestk_iotminds'
}

var connection
	connection = mysql.createConnection(db_config)
	connection.connect(function (err) {
		if(err){
			console.log('DB_ERROR_OCCURED: Please enable your database first')
		}
	})

module.exports = connection