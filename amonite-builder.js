const Amonite = require('./amonite');
const HttpCode = require('http-code-async');
const Arguments = require('http-arguments-async');
const File = require('bson-async').File;
const http = require('http');
const path = require('path');

class AmoniteBuilder extends Amonite {

    server(hostname, port, then) {

        let self = this;
        const server = http.createServer(async function (req, res) {
            let current = self.clone(req, res);
            await current.executeSync();
            if (typeof then === 'function')
                then(req, res);
        });
        server.listen(port, hostname, function () {
            return console.log('\x1b[1m', `Server running at http://${hostname}:${port}/`, '\x1b[0m');
        });
        return this;

    }
}

const amo = new AmoniteBuilder(null, null);
amo.Amonite = AmoniteBuilder;

amo.addConfiguration(async function (req) {
    req.file = req.url.replace(/[?#].*$/, '').replace(/\/$/, '/index.html');
    req.arguments = new Arguments();
    await req.arguments.set(req);
});

amo.addController(async function (req) {
    let file = new File(amo.PATH + req.file);
    if (await file.exists() && !file.path.match(/\.sjs$/)) {
        return await file.read();
    }
});

amo.addController(async function (req) {
    let file = new File(amo.PATH + req.file);
    if (await file.exists() && file.path.match(/\.sjs$/)) {
        return require(file.path);
    }
});

amo.addController(async function (req) {
    let file = new File(amo.PATH + req.file + '.sjs');
    if (await file.exists()) {
        return require(file.path);
    }
});

amo.PATH = path.normalize(__dirname + "/../theme");
HttpCode.DEBUG_MODE = true;

module.exports = amo;
