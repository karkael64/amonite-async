// before

const moke = require('./mokes'), should = moke.should, assert = moke.assert;

// main

console.info("\x1b[32m", "server…", "\x1b[0m");

(function () {
    const http = require('../amonite-builder');
    const server = http.server({
        "port": 8000,
        "folder": __dirname + "/files"
    });
    server.addEnd(function(req, res){
        console.log(`\x1b[2mrequest (${res.httpCode.getCode()}) \x1b[0m${req.url}`);
    });
    server.addEnd(function(req){
        if(req.arguments.get('kill'))
            server.close();
    });
})();


//after

