const HttpCode = require('http-code-async'),
    Error = HttpCode.Error,
    Answerable = HttpCode.Answerable,

    http = require('http'),
    https = require('https'),
    zlib = require('zlib'),
    IncomingMessage = http.IncomingMessage,
    ServerResponse = http.ServerResponse;

function is_function(el) {
    return (typeof el === 'function');
}

function is_object(el) {
    return (typeof el === 'object') && (el !== null);
}

/**
 * @alias Buffer.byteLength
 * @param body {string|buffer}
 * @returns {number}
 */

function body_length(body) {
    return Buffer.byteLength(body);
}

class Amonite {

    constructor(req, res, options) {
        this.configurations = [];
        this.controllers = [];
        this.ends = [];

        this.req = req;
        this.res = res;

        if (is_object(options)) {
            this.cache_duration = options.cacheDuration || Amonite.CACHE_DURATION;
            this.use_cookies = options.useCookies || Amonite.USE_COOKIE;
        }
    }


    /**
     * @method <addConfiguration> add a function that should be executed before controllers, about to prepare
     *      environment, request or response.
     * @param fn {function}
     * @returns {Amonite}
     */

    addConfiguration(fn) {
        this.configurations.push(fn);
        return this;
    }

    async configure() {
        let current;
        while (current = this.configurations.shift()) {
            if (is_function(current)) {
                await current.call(this, this.req, this.res);
            }
        }
        return this;
    }


    /**
     * @method <addController> add a function that should returns executable or nothing if it doesn't match.
     * @param fn {function}
     * @returns {Amonite}
     */

    addController(fn) {
        this.controllers.push(fn);
        return this;
    }

    async getController() {
        let current, res;
        while (current = this.controllers.shift()) {
            if (is_function(current) && (res = await current.call(this, this.req, this.res))) {
                return res;
            }
        }
        throw new HttpCode(404);
    }


    /**
     * @method <addEnd> add a function that should be executed after sending httpCode, about to log or free memory.
     * @param fn {function}
     * @returns {Amonite}
     */

    addEnd(fn) {
        this.ends.push(fn);
        return this;
    }

    async end() {
        let current;
        while (current = this.ends.shift()) {
            if (is_function(current)) {
                await current.call(this, this.req, this.res);
            }
        }
        return this;
    }


    /**
     * @method <getHttpCode> returns an HttpCode instance of some contents, like Answerable or string.
     * @param el {function|HttpCode|Answerable|string|*}
     * @returns {Promise.<HttpCode>}
     */

    async getHttpCode(el) {

        try {
            if (is_function(el)) {
                el = await el.call(this, this.req, this.res);
            }

            if (el instanceof HttpCode) {
                return el;
            }
            else {
                if (el instanceof Answerable) {
                    el = await el.getContent(this.req, this.res);
                }
                return this.bodyToHttpCode(el);
            }
        }
        catch (err) {
            if (err instanceof HttpCode) {
                return err;
            }
            else {
                return new HttpCode(500, null, err);
            }
        }
    }


    /**
     * @method <bodyToHttpCode> translate a string to an HttpCode. It cares about "No Content" & "Not Modified" status.
     * @param str {string}
     * @returns {HttpCode}
     */

    bodyToHttpCode(str) {

        str = "" + str;
        let req_etag = this.req.arguments.getHeader('if-none-match') || this.req.arguments.getHeader('last-modified');

        if (str.length === 0)
            return new HttpCode(204, "");

        let encoding = this.req.arguments.getHeader("accept-encoding"),
            etag = JSON.stringify(Answerable.bodyEtag(str)),
            httpCode;

        //  should compress
        if (!encoding || encoding.match(/\bdeflate\b/i)) {
            str = zlib.deflateSync(str);
            encoding = 'deflate';
        }
        else if (encoding && encoding.match(/\bgzip\b/i)) {
            str = zlib.gzipSync(str);
            encoding = 'gzip';
        }
        else {
            encoding = null;
        }

        //  is modified
        httpCode = (etag === req_etag) ? new HttpCode(304, "") : new HttpCode(200, str);

        //  send
        if (encoding)
            httpCode.addHeader('Content-Encoding', encoding);
        httpCode.addHeader('ETag', etag);
        httpCode.addHeader('Content-Length', body_length(str).toString());
        return httpCode;
    }


    /**
     * @function <sendHttpCode> send client Response with an HttpCode object.
     * @param httpCode {HttpCode}
     * @throws {Error}
     */

    async sendHttpCode(httpCode) {

        if (httpCode instanceof HttpCode) {

            this.res.httpCode = httpCode;

            let code = httpCode.getCode(),
                title = httpCode.getTitle(),
                cookies = httpCode.getCookiesToString();

            if (cookies) {
                httpCode.addHeader('Set-Cookie', cookies);
            }

            if (code === 200) {

                let body = httpCode.message,
                    url = this.req.url,
                    cache = this.cache_duration;

                httpCode.addHeader('Connection', 'keep-alive');
                httpCode.addHeader('Content-Length', body_length(body).toString());
                httpCode.addHeader('Content-Type', Answerable.getFilenameMime(url));
                httpCode.addHeader('Cache-Control', 'public, max-age=' + Math.round(cache / 1000));
                httpCode.addHeader('Date', ( new Date() ).toGMTString());
                httpCode.addHeader('Expires', ( new Date(Date.now() + ( cache )) ).toGMTString());

                this.res.writeHead(code, title, httpCode.getHeaders());
                this.res.end(body);
                return this;
            }
            else if (code === 307 || code === 308) {

                let body = httpCode.message;
                httpCode.addHeader('Location', body);

                this.res.writeHead(code, title, httpCode.getHeaders());
                this.res.end(body);
                return this;
            }
            else {

                let body = await httpCode.getContent(this.req);
                httpCode.addHeader('Content-Length', body_length(body).toString());
                httpCode.addHeader('Content-Type', Answerable.getFilenameMime(this.req.file));

                this.res.writeHead(code, title, httpCode.getHeaders());
                this.res.end(body);
                return this;
            }
        }
        else
            throw new Error('First parameter is not an HttpCode instance.');
    }


    /**
     * @method <clone> clone the selected Amonite instance, duplicate its configurators and its ccontrollers, with new
     *      request & response objects set in parameters.
     * @param req {IncomingMessage}
     * @param res {ServerResponse}
     * @returns {Amonite}
     */

    clone(req, res) {
        let a = new Amonite(req, res);
        a.configurations = this.configurations.slice();
        a.controllers = this.controllers.slice();
        a.ends = this.ends.slice();
        a.cache_duration = this.cache_duration;
        a.use_cookies = this.use_cookies;
        return a;
    }

    execute(next) {
        if (is_function(next)) {
            this.executeSync().then(next).catch(next);
        }
        else {
            this.executeSync();
        }
    }

    async executeSync() {
        let res;
        try {
            await this.configure();
            res = await this.getController();
        }
        catch (err) {
            res = err;
        }
        await this.sendHttpCode(await this.getHttpCode(res));
        await this.end();
    }

    /**
     * @method <server> run an http server based on this configurations, controllers & enders.
     * @returns {Amonite}
     */

    server(options) {

        if (is_object(options)) {
            if (options.cacheDuration !== undefined) this.cache_duration = options.cacheDuration;
            if (options.useCookies !== undefined) this.use_cookies = options.useCookies;
        }
        let self = this;
        let server = this.http = http.createServer(function (req, res) {
            self.clone(req, res).execute();
        });
        server.listen.apply(server, arguments);
        return this;

    }


    /**
     * @method <serverSecure> run an http server based on this configurations, controllers & enders.
     * @returns {Amonite}
     */

    serverSecure(options) {

        if (is_object(options) && options.key && options.cert) {
            if (options.cache_duration !== undefined) this.cache_duration = options.cache_duration;
            if (options.use_cookies !== undefined) this.use_cookies = options.use_cookies;

            let https_options = {"key": options.key, "cert": options.cert};
            let self = this;
            let server = this.http = https.createServer(https_options, function (req, res) {
                self.clone(req, res).execute();
            });
            server.listen.apply(server, arguments);
            return this;
        }
        else {
            throw new Error("Bad arguments");
        }

    }


    /**
     * @method <close> is used for close & unset the server.
     * @param next {function}
     * @returns {Amonite}
     */

    close(next) {
        if (this.http) {
            this.http.close(next);
            this.http = null;
        }
        return this;
    }
}

Amonite.Document = require('./document');
Amonite.Component = require('./component');

Amonite.CACHE_DURATION = 120000;
Amonite.USE_COOKIE = true;

module.exports = Amonite;