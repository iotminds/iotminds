var express = require("express")
var router = express.Router()
var db = require("../config/db.js")
var crypto = require("crypto")


router.get("/new",isLoggedIn,function (req,res) {
	res.render("create_channel.ejs")
})

router.post("/new",isLoggedIn,function (req,res) {
	var channel_name = req.body.channel_name
	var channel_description = req.body.channel_description
	var image_url = req.body.img_url
	var owner_id = req.user.id

	db.query("INSERT INTO channels (owner_id,name,description,created_at,image_url) VALUES(?,?,?,NOW(),?)",[owner_id,channel_name,channel_description,image_url],function (err,result) {
		if (err) {
			res.json({code:400,message:"DB_ERROR"})
		}else{
			res.redirect("/profile")
		}
	})
})

router.get("/delete",isLoggedIn,function (req,res) {
	var id = req.query.id

	db.query("DELETE FROM datas WHERE channel_id = ? ",[id],function (err,result) {
		if (err) {
			res.json({code:400,message:"DB_ERROR_here"})
		}else{
			db.query("DELETE FROM api_keys WHERE channel_id=?",[id],function (err,result) {
				if(err){
					res.json(err)
				}else{
					db.query("DELETE FROM components WHERE channel_id=?",[id],function (err,result) {
						if (err) {
							res.json(err)
						}else{
							db.query("DELETE FROM channels WHERE id=?",[id],function (err,result) {
								if(err){
									res.json({code:400,message:"DB_ERROR"})
								}else{
									res.redirect("/profile")
								}
							})
						}
					})
				}
			})
		}
	})

})

router.get("/:channel_id",function (req,res) {
	var channel_id = req.params.channel_id
	var name
	var datas
	db.query("SELECT * FROM channels WHERE id=?",[channel_id],function (err,result) {
		if(err){
			res.json(err)
		}else{
			if(result.length>0){
				name=result[0].name
				created_at=result[0].created_at		
				db.query("SELECT * FROM datas WHERE channel_id=?",[channel_id],function (err,result) {
					if (err) {
						res.json({code:400,message:"DB_ERROR"})
					}else{
						datas = result
					}
				})

				db.query("SELECT * FROM components WHERE channel_id=?",[channel_id],function (err,result) {
					if(err){
						res.json({code:400,message:"DB_ERROR"})
					}else{
						res.render("channel.ejs",{
							components : result,
							channel_id : channel_id,
							created_at: created_at,
							channel_name : name,
							datas : datas
						})
					}
				})

			}else{
				res.json({code:404,message:"CHANNEL_NOT_FOUND"})
				return

			}
		}
	})
})

router.get("/:channel_id/new_component",isLoggedIn,function (req,res) {
	var channel_id = req.params.channel_id
	res.render("create_component.ejs",{
		channel_id : channel_id
	})
})

router.post("/:channel_id/new_component",isLoggedIn,function (req,res) {
	var channel_id = req.params.channel_id
	var component_name = req.body.name
	var type = req.body.type
	var api_key = crypto.randomBytes(16).toString('hex')

	db.query("INSERT INTO components (channel_id,name,created_at,last_updated,api_key) VALUES(?,?,NOW(),NOW(),?)",[channel_id,component_name,api_key],function (err,result) {
		if (err) {
			res.json(err)
		}else{
			var component_id = result.insertId
			var owner_id = req.user.id
			db.query("INSERT INTO api_keys (api_key,owner_id,component_id,channel_id) VALUES(?,?,?,?)",[api_key,owner_id,component_id,channel_id],function (err,result) {
				if(err){
					res.json({code:400,message:"DB_ERROR"})
				}else{
					res.redirect("/channels/"+channel_id)					
				}
			})
		}
	})

})

router.get("/components/:component_id",isLoggedIn,function (req,res) {
	var component_id = req.params.component_id
	db.query("SELECT value FROM datas WHERE component_id = ?",[component_id],function (err,result) {
		if(err){
			res.json(err)
		}else{
			var dataset = []
			for (var i = 0; i < result.length; i++) {
				dataset.push(result[i].value)
			}
			res.json(dataset)
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