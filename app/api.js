var express = require("express")
var router = express.Router()
var db = require("../config/db.js")
var utilities = require("./utilities.js")

router.get("/update",function (req,res) {
	var key = req.query.key
	var value = req.query.value

	if(!key || !value)
		return utilities.printError(res, "Invalid arguments")

	utilities.getKeyInfo(key, function(err, key_info) {
		if(err)
			return utilities.printError(res, err)

		if(!utilities.checkKey(key_info, utilities.accessConstants.COMPONENT_WRITE))
			return utilities.printError(res, "Insufficient privileges")

		update_result = utilities.updateComponent(key_info.component_id, key_info.channel_id, value)

		if(update_result instanceof Error)
            return utilities.printError(res, update_result)

		utilities.printSuccess(res)
	})
})

router.get("/channels",function (req,res) {
	var key = req.query.key

	if(!key)
		return utilities.printError(res, "Invalid arguments")

	utilities.getKeyInfo(key, function(err, key_info)
	{
        if(err)
            return utilities.printError(res, err)

        if(!utilities.checkKey(key_info, utilities.accessConstants.CHANNEL_LIST))
            return utilities.printError(res, "Insufficient privileges")

        utilities.getChannels(key_info.user_id, function(err, result)
		{
            if(err)
                return utilities.printError(res, err)

            utilities.printSuccess(res, result)
        })
	})
})

router.get("/components", function(req, res)
{
    var key = req.query.key

    if(!key)
        return utilities.printError(res, "Invalid arguments")

    utilities.getKeyInfo(key, function(err, key_info)
    {
        if(err)
            return utilities.printError(res, err)

        if(!utilities.checkKey(key_info, utilities.accessConstants.COMPONENT_LIST))
            return utilities.printError(res, "Insufficient privileges")

        utilities.getComponents(key_info.channel_id, function(err, result)
        {
            if(err)
                return utilities.printError(res, err)

            utilities.printSuccess(res, result)
        })
    })
})

router.get("/retrieve",function (req,res) {
    var key = req.query.key

    if(!key)
        return utilities.printError(res, "Invalid arguments")

    utilities.getKeyInfo(key, function(err, key_info)
    {
        if(err)
            return utilities.printError(res, err)

        if(!utilities.checkKey(key_info, utilities.accessConstants.COMPONENT_READ))
            return utilities.printError(res, "Insufficient privileges")

        utilities.getComponentData(key_info.component_id, function(err, result)
        {
            if(err)
                return utilities.printError(res, err)

            utilities.printSuccess(res, result)
        })
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