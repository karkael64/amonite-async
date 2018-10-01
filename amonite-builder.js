const Amonite = require('./amonite'),
    Arguments = require('http-arguments-async'),
    File = require('bson-async').File;

function is_object(el) {
    return (typeof el === 'object') && (el !== null);
}

class AmoniteBuilder extends Amonite {

    constructor(req, res) {
        super(req, res);
        this.folder = __dirname;
    }

    server() {
        this.folder = is_object(arguments[0]) && arguments[0].folder || this.folder;
        return super.server.apply(this, arguments);
    }

    serverSecure(options) {
        this.folder = is_object(options) && options.folder || this.folder;
        return super.serverSecure.apply(this, arguments);
    }
}

const amo = new AmoniteBuilder(null, null);

amo.addConfiguration(async function (req) {
    req.file = req.url.replace(/[?#].*$/, '').replace(/\/$/, '/index.html');
    req.arguments = new Arguments();
    await req.arguments.set(req);
});

amo.addController(async function (req) {
    let file = File.build(amo.folder + req.file);
    if (await file.exists() && !file.path.match(/\.sjs$/)) {
        return await file.read();
    }
});

amo.addController(async function (req) {
    let file = File.build(amo.folder + req.file);
    if (await file.exists() && file.path.match(/\.sjs$/)) {
        return require(file.path);
    }
});

amo.addController(async function (req) {
    let file = File.build(amo.folder + req.file + '.sjs');
    if (await file.exists()) {
        return require(file.path);
    }
});

module.exports = amo;
