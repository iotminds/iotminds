var express = require("express")
var router = express.Router()
var db = require("../config/db.js")
var crypto = require("crypto")
var utilities = require("./utilities.js")

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

	db.query("DELETE FROM data WHERE channel_id = ? ",[id],function (err,result) {
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
	var data

	db.query("SELECT * FROM channels WHERE id=?",[channel_id],function (err,result) { /* TODO: refactor this */
		if(err)
			return utilities.printError(res, err)

		if(!result || result.length == 0)
			return utilities.printError(res, "No such channel")

		name=result[0].name
		created_at=result[0].created_at

		utilities.getComponents(channel_id, function(err, result){
			if (err)
				return utilities.printError(res, err)

			res.render("channel.ejs",{
				components : result,
				channel_id : channel_id,
				created_at: created_at,
				channel_name : name,
				data : data
			})
		})
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
	var api_key = crypto.randomBytes(8).toString('hex')

	db.query("INSERT INTO components (channel_id,name,created_at,last_updated,api_key,type) VALUES(?,?,NOW(),NOW(),?,?)",[channel_id,component_name,api_key,type],function (err,result) {
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

router.get("/components/:component_id",function (req,res) {
	var component_id = req.params.component_id

	utilities.getComponentData(component_id, function(err, result)
	{
		if(err)
			return utilities.printError(res, err)

		res.json(result.map(function(t){return t.value;}));
	})
})

router.get("/components/delete/:component_id",isLoggedIn,function (req,res) {
	var component_id = req.params.component_id
	var channel_id
	db.query("SELECT * FROM components WHERE id=?",[component_id],function (err,result) {
		if(err){
			res.json(err)
		}else{
			channel_id=result[0].channel_id
		}
	})
	db.query("DELETE FROM data WHERE component_id=?",[component_id],function (err,result) {
		if(err){
			res.json(err)
		}else{
			db.query("DELETE FROM api_keys WHERE component_id=?",[component_id],function (err,result) {
				if(err){
					res.json(err)
				}else{
					db.query("DELETE FROM components WHERE id=?",[component_id],function (err,result) {
						res.redirect("/channels/"+channel_id+"#home")
					})
				}
			})
		}
	})
})

router.get("/regenerate/:component_id",isLoggedIn,function (req,res) {
	var component_id = req.params.component_id
	var new_api_key = crypto.randomBytes(16).toString('hex')

	db.query("UPDATE api_keys SET api_key=? WHERE component_id=?",[new_api_key,component_id],function (err,result) {
		if(err){
			res.json(err)
		}else{
			res.json(result)
		}
	})
/*	db.query("SELECT * FROM api_keys WHERE component_id=?",[component_id],function (err,result) {
		if(err){
			res.json(err)
		}else{
			var owner_id = result[0].owner_id
			var channel_id = result[0].channel_id
			var api_key = crypto.randomBytes(16).toString('hex')

			db.query("DELETE FROM api_keys WHERE component_id=?",[component_id],function (err,result) {
				if(err){
					res.json(err)
				}else{
					db.query("INSERT INTO api_keys (api_key,owner_id,channel_id) VALUES(?,?,?)",[api_key,owner_id,channel_id],function (err,result) {
						if(err){
							res.json(err)
						}else{
							res.redirect("/channels")
						}
					})
				}
			})
		}
	})
*/
})


function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}


module.exports = router