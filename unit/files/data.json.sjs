const Bson = require('bson-async');

class Log extends Bson {}

Bson.FOLDER = __dirname + '/';

module.exports = async function (req) {

    let rows = [];

    if(req.arguments.get('add')) {
        let log = new Log({"date": Date.now()});
        await log.save();
    }

    await Log.select(rows.push.bind(rows));

    return JSON.stringify({
        "success": true,
        "results": rows
    });
};