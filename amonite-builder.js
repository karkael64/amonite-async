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

        this.addConfiguration(async function (req) {
            req.file = req.url.replace(/[?#].*$/, '').replace(/\/$/, '/index.html');
            req.arguments = new Arguments();
            await req.arguments.set(req);
        });

        this.addController(async function (req) {
            let file = File.build(this.folder + req.file);
            if (await file.exists() && !file.path.match(/\.sjs$/)) {
                return await file.read();
            }
        });

        this.addController(async function (req) {
            let file = File.build(this.folder + req.file);
            if (await file.exists() && file.path.match(/\.sjs$/)) {
                return require(file.path);
            }
        });

        this.addController(async function (req) {
            let file = File.build(this.folder + req.file + '.sjs');
            if (await file.exists()) {
                return require(file.path);
            }
        });
    }

    server() {
        this.folder = is_object(arguments[0]) && arguments[0].folder || this.folder;
        return super.server.apply(this, arguments);
    }

    serverSecure(options) {
        this.folder = is_object(options) && options.folder || this.folder;
        return super.serverSecure.apply(this, arguments);
    }

    clone(req, res) {
        let a = new AmoniteBuilder(req, res);
        a.configurations = this.configurations.slice();
        a.controllers = this.controllers.slice();
        a.ends = this.ends.slice();
        a.cache_duration = this.cache_duration;
        a.use_cookies = this.use_cookies;
        a.folder = this.folder;
        return a;
    }
}

AmoniteBuilder.Amonite = Amonite;

module.exports = AmoniteBuilder;
