const Bson = require('bson-async');
const path = require('path');

class Log extends Bson {
}

Bson.FOLDER = __dirname + '/';

module.exports = async function () {

    let rows = [];

    //  let log = new Log({"date": Date.now()});
    //  await log.save();

    await Log.select(function (data) {
        data.time = (new Date(data.date)).toLocaleString();
        rows.push(data);
    });

    return JSON.stringify({
        "success": true,
        "results": rows
    });
};