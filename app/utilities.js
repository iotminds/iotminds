var db = require("../config/db.js")
var crypto = require("crypto")

exports.accessConstants =
    {
        COMPONENT_READ: 1,
        COMPONENT_READ_ANY: 2,
        COMPONENT_WRITE: 4,
        COMPONENT_WRITE_ANY: 8,
        COMPONENT_LIST: 16,
        COMPONENT_CREATE: 32,
        COMPONENT_REMOVE: 64,
		CHANNEL_READ: 128,
        CHANNEL_READ_ANY: 256,
		CHANNEL_MODIFY: 512,
        CHANNEL_MODIFY_ANY: 1024,
        CHANNEL_LIST: 2048,
        CHANNEL_CREATE: 4096,
        CHANNEL_REMOVE: 8192
    }

exports.getKeyInfo = function(key, callback)
{
    db.query("SELECT * FROM api_keys WHERE api_key=?",[key],function (err, result)
    {
        if(err)
        {
            callback(err, null)
        }
        else if(result == [])
        {
            callback(Error("INVALID_API_KEY"), null)
        }
        else {
            if(!result[0])
            {
                callback(Error("INVALID_API_KEY"), null)
                return
            }

            callback(null,
                {
                    access: result[0].access,
                    user_id: result[0].user_id,
                    component_id: result[0].component_id,
                    channel_id: result[0].channel_id
                })
        }
    })
}

exports.executeWithKey = function(key, privilege, callback)
{
    if(!key)
        return callback(new Error("You need to provide an API key"))

    if(!privilege)
        return callback(new Error("Invalid privilege level"))

    exports.getKeyInfo(key, function(err, key_info)
    {
        if(err)
            return callback(err)

        if(!exports.checkKey(key_info, privilege))
            return callback(new Error("Insufficient privileges"))

        callback(null, key_info)
    })
}

exports.updateComponent = function(component_id, channel_id, value)
{
    db.query("INSERT INTO data (value,component_id,channel_id,created_at) VALUES(?,?,?,NOW())", [value, component_id, channel_id], function (err,result)
    {
        if (err)
        {
            return err
        }
        else
        {
            return result
        }
    })
}

exports.createChannel = function(channel_object, callback)
{
    db.query("INSERT INTO channels (owner_id,name,description,created_at,image_url) VALUES(?,?,?,NOW(),?)",
        [
            channel_object.owner_id,
            channel_object.channel_name,
            channel_object.channel_description + "",
            channel_object.image_url + ""
        ],
        function (err, res)
        {
            if(err)
                return callback(err)

            callback(err, res.insertId)
        }
    )
}

exports.createComponent = function(component_object, callback)
{
    var key = crypto.randomBytes(8).toString('hex')

    db.query("INSERT INTO components (channel_id, name, type, created_at, last_updated, api_key) VALUES (?, ?, ?, NOW(), NOW(), ?)",
        [
            component_object.channel_id,
            component_object.name,
            component_object.type,
			key
        ],
        function (err, res) {
    		if(err)
    			return callback(err)

    		db.query("INSERT INTO api_keys (api_key, secret, access, user_id, component_id, channel_id) VALUES (?, '0000000000000000', ?, ?, ?, ?)",
				[
					key,
					exports.accessConstants.COMPONENT_READ | exports.accessConstants.COMPONENT_WRITE,
					component_object.user_id,
                    res.insertId,
					component_object.channel_id
				],
				function(err2, res2) {
    				callback(err2, { id: res.insertId, key: key })
				})
        })
}

exports.getChannel = function(channel_id, callback)
{
    db.query("SELECT * FROM channels WHERE channel_id = ?", channel_id, callback)
}

exports.getChannels = function(id, callback)
{
    db.query("SELECT * FROM channels WHERE owner_id = ?", id, callback)
}

exports.getComponents = function(id, callback)
{
    db.query("SELECT * FROM components WHERE channel_id = ?", id, callback)
}

exports.getComponentData = function(id, callback)
{
    db.query("SELECT id,value,created_at FROM data WHERE component_id = ?", id, callback)
}

exports.checkKey = function(key, access_type)
{
    if(!key || !key.access)
        return false;

    return !!(key.access & access_type);
}

exports.printError = function(res, msg, code)
{
    if(msg instanceof Error)
        msg = msg.message

    res.json(
        {
            result: "error",
            error_code: code,
            error_msg: msg
        })
}

exports.printSuccess = function(res, val)
{
    res.json(
        {
            result: "success",
            data: val
        })
}