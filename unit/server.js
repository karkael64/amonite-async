// before

const moke = require('./mokes'), should = moke.should, assert = moke.assert, stub = moke.stub,
    IncomingMessage = moke.IncomingMessage, ServerResponse = moke.ServerResponse;

const http = require('http');
stub(http, 'createServer', moke.createServer);
stub(http, 'IncomingMessage', IncomingMessage);
stub(http, 'ServerResponse', ServerResponse);

const AmoniteBuilder = require('../amonite-builder');


// main

console.info("\x1b[32m", "server…", "\x1b[0m");

(function () {
    let amoniteBuilder = new AmoniteBuilder();
    let server = amoniteBuilder.server({"port": 8000, "folder": __dirname + "/files"});
    server.addEnd(function (req, res) {

        should(req.arguments.get('test'), undefined, "should return null when variable not set");
        should(req.arguments.get('data'), "cool there", "should return the data field");
        should(req.arguments.get('version'), 3.14159, "should return the version field");
        should(req.arguments.getHeader('cONNecTiOn'), "Keep-Alive", "should return field no matter the case");
        should(req.arguments.getHeader('none'), undefined, "should return null when header not set");

        should(res.body.indexOf("<!doctype html>\n<html>\n<head>\n    <meta charset=\"UTF-8\">\n"), 0, "should send body");
        should(res.httpCode.getHeader("etag"), '"0a371557bdc294c8478ff6abc3b905411ff6683e"', "should hash body with success");
        should(res.body.length, 410, "should size 410 characters");
        should(res.httpCode.getHeader("Content-Length"), "410", "should head content length of 410");

        server.close();
    });
    server.http.testRequest(new IncomingMessage('POST', '/index.html', {
        "Connection": "Keep-Alive",
        "Accept-Encoding": "identity",
        "Content-Type": "application/json"
    }, ['{"data":"cool there","ver', 'sion":3.14159}']));
})();

(function () {
    let amoniteBuilder = new AmoniteBuilder();
    let server = amoniteBuilder.server({"port": 7890, "folder": __dirname + "/files"});
    server.addEnd(function (req, res) {

        should(res.httpCode.getCode(), 200, "should be OK (200)");
        should(res.httpCode.getHeader("Content-Length"), "9797", "should head content length of 9797");

        server.close();
    });
    server.http.testRequest(new IncomingMessage('GET', '/common.js', {}));
})();


//after

http.createServer.revert();
http.IncomingMessage.revert();
http.ServerResponse.revert();
