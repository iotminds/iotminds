var db = require("../config/db.js")

exports.accessConstants =
	{
		COMPONENT_READ: 1,
		COMPONENT_WRITE: 2,
		COMPONENT_LIST: 4,
		COMPONENT_CREATE: 8,
		COMPONENT_REMOVE: 16,
		CHANNEL_READ: 32,
		CHANNEL_MODIFY: 64,
		CHANNEL_LIST: 128,
		CHANNEL_CREATE: 256,
		CHANNEL_REMOVE: 512
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