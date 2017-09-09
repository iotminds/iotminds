//Please update your database info here
var mysql = require("mysql")
var db_config = {
	host	: '91.227.6.16',
	user	: 'btahtaci_iotmind',
	password: '1997.burakT',
	database: 'btahtaci_iotminds'
}

var connection
	connection = mysql.createConnection(db_config)
	connection.connect(function (err) {
		if(err){
			console.log('DB_ERROR_OCCURED: Please enable your database first')
		}
	})

module.exports = connection