//  before

const moke = require('./mokes'), should = moke.should, stub = moke.stub,
    IncomingMessage = moke.IncomingMessage, ServerResponse = moke.ServerResponse;

const http = require('http');
stub(http, 'createServer', moke.createServer);
stub(http, 'IncomingMessage', IncomingMessage);
stub(http, 'ServerResponse', ServerResponse);

const AmoniteBuilder = require('../amonite-builder');

function body_length(body) {
    return Buffer.byteLength(body);
}


//  main

console.info("\x1b[32m", "encode…", "\x1b[0m");

(function () {
    let amoniteBuilder = new AmoniteBuilder();
    const server = amoniteBuilder.server({port: 7999, folder: __dirname + "/files"});
    server.addEnd(function (req, res) {

        let expect_body = "x�m�1\u000e� \f\u0005лxf�\r6$W�:T\tC�L\u0001�����L��~_߾!�m�)���\u0012\r\\1�3��u�" +
            "��\u0011V\u0012�\u0017\f�J\"\u0006����\u0019�В�ʃ\u0012�\u0000����U����\u0006\r���O�LJ���U'enoqW�G-)u\r�]" +
            "���F�";

        should(res.body.toString(), expect_body, "should return this body, deflate formatted");
        should(expect_body.length, res.body.toString().length, "should size same 120 characters in utf8");
        should(res.httpCode.getHeader('Content-Length'), res.body.length.toString(),
            "should size same 124 characters in binaries in buffer");
    });
    server.http.testRequest(new IncomingMessage('GET', '/data.json', {}));
})();


(function () {
    let amoniteBuilder = new AmoniteBuilder();
    const server = amoniteBuilder.server({port: 7999, folder: __dirname + "/files"});
    server.addEnd(function (req, res) {

        let expect_body = "\u001f�\b\u0000\u0000\u0000\u0000\u0000\u0000\u0003m�1\u000e� \f\u0005лxf�\r6$W�" +
            ":T\tC�L\u0001�����L��~_߾!�m�)���\u0012\r\\1�3��u���\u0011V\u0012�\u0017\f�J\"\u0006����\u0019�В�ʃ\u0012�" +
            "\u0000����U����\u0006\r���O�LJ���U'enoqW�G-)u\r�]����a\f\u0001\u0000\u0000";

        should(res.body.toString(), expect_body, "should return this body, gzip formatted");
        should(expect_body.length, res.body.toString().length, "should size same 132 characters in utf8");
        should(res.httpCode.getHeader('Content-Length'), res.body.length.toString(),
            "should size same 136 characters in binaries in buffer");
    });
    server.http.testRequest(new IncomingMessage('GET', '/data.json', {"Accept-Encoding": "gzip"}));
})();


//  after

http.createServer.revert();
http.IncomingMessage.revert();
http.ServerResponse.revert();
