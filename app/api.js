var express = require("express")
var router = express.Router()
var db = require("../config/db.js")
var utilities = require("./utilities.js")

router.get("/update",function (req,res) {
    var key = req.query.key
    var value = req.query.value

    if(!key || !value)
        return utilities.printError(res, "Invalid arguments")

    utilities.executeWithKey(key, utilities.accessConstants.COMPONENT_WRITE, function(err, key_info)
    {
        if(err)
            return utilities.printError(res, err)

        update_result = utilities.updateComponent(key_info.component_id, key_info.channel_id, value)

        if(update_result instanceof Error)
            return utilities.printError(res, update_result)

        utilities.printSuccess(res)
    })
})

router.get("/channels",function (req,res) {
    utilities.executeWithKey(req.query.key, utilities.accessConstants.CHANNEL_LIST, function(err, key_info)
    {
        if(err)
            return utilities.printError(res, err)

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
    utilities.executeWithKey(req.query.key, utilities.accessConstants.COMPONENT_LIST, function(err, key_info)
    {
        if(err)
            return utilities.printError(res, err)

        utilities.getComponents(key_info.channel_id, function(err, result)
        {
            if(err)
                return utilities.printError(res, err)

            utilities.printSuccess(res, result)
        })
    })
})

router.get("/retrieve",function (req,res)
{
    utilities.executeWithKey(req.query.key, utilities.accessConstants.COMPONENT_READ, function(err, key_info)
    {
        if(err)
            return utilities.printError(res, err)

        utilities.getComponentData(key_info.component_id, function(err, result)
        {
            if(err)
                return utilities.printError(res, err)

            utilities.printSuccess(res, result)
        })
    })
})

router.get("/new_channel", function (req, res)
{
    var key = req.query.key

    if(!key || !req.query.channel_name)
        return utilities.printError(res, "Invalid arguments")

    utilities.executeWithKey(key, utilities.accessConstants.CHANNEL_CREATE, function(err, key_info)
    {
        if(err)
            return utilities.printError(res, err)

        utilities.createChannel(
            {
                channel_name: req.query.channel_name,
                channel_description: req.query.channel_description,
                image_url: req.query.img_url,
                owner_id: key_info.user_id
            },
            function(err, id)
            {
                if(err)
                {
                    return utilities.printError(res, err)
                }

                utilities.printSuccess(res, {channel_id: id})
            }
        )
    })
})

router.get("/new_component", function (req, res) {

})

router.get("/delete_channel", function(req, res)
{
    var key = req.query.key

    if(!key || !req.query.channel_id)
        return utilities.printError(res, "Invalid arguments")

})

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = router