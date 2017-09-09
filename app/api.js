var express = require("express")
var router = express.Router()
var db = require("../config/db.js")

router.get("/update",function (req,res) {
	var api_key = req.query.api_key
	console.log(api_key)
	var value = req.query.value
	var component_id
	var channel_id

	db.query("SELECT * FROM api_keys WHERE api_key=?",[api_key],function (err,result) {
		if(err){
			res.send("andajsdnaklsdmasd")
		}else{
			if(!result[0]){
				res.json({code:401,message:"INVALID_API_KEY"})
				return
			}
			component_id = result[0].component_id
			channel_id = result[0].channel_id
			db.query("INSERT INTO datas (value,component_id,channel_id,created_at) VALUES(?,?,?,NOW())",[value,component_id,channel_id],function (err,result) {
				if (err) {
					res.json({code:400,message:"DB_ERROR"})
				}else{
					res.json({code:200,message:"SUCCESSFULLY_ADDED"})
				}
			})
		}
	})
})

router.get("/channels",function (req,res) {
	var user_id = req.query.user_sid

	db.query("SELECT * FROM channels WHERE owner_id = ?",[user_id],function (result,err) {
		if (err) {
			res.json(err)
		}else{
			res.json(result)
		}
	})
})

router.get("/retrieve",function (req,res) {
	var api_key = req.query.api_key
	var component_id

	db.query("SELECT * FROM api_keys WHERE api_key=?",[api_key],function (err,result) {
		if(err){
			res.json({code:400,message:"DB_ERROR"})
		}else{
			if(!result[0]){
				res.json({code:401,message:"INVALID_API_KEY"})
				return
			}
			component_id = result[0].component_id
			db.query("SELECT * FROM datas WHERE component_id=?",[component_id],function (err,result) {
				if(err){
					res.json({code:400,message:"DB_ERROR"})
				}else{
					if(!result[0]){
						res.json({code:400,message:"CAN_NOT_FIND_ENTRIES"})
					}else{
						res.json(result)
					}
				}
			})
		}
	})
})

function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

module.exports = router