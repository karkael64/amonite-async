const HttpCode = require('http-code-async'),
    Error = HttpCode.Error,
    Answerable = HttpCode.Answerable,

    http = require('http'),
    IncomingMessage = http.IncomingMessage,
    ServerResponse = http.ServerResponse;

function is_function(el) {
    return (typeof el === 'function');
}

/**
 * @alias Buffer.byteLength
 * @param body string|buffer
 * @returns {Number}
 */

function body_length(body) {
    return Buffer.byteLength(body);
}

class Amonite {

    constructor(req, res) {
        this.configurations = [];
        this.controllers = [];

        this.req = req;
        this.res = res;
    }


    /**
     * @method <addConfiguration> add a function that should be executed before controllers, about to prepare
     *      environment, request or response.
     * @param fn
     */

    addConfiguration(fn) {
        this.configurations.push(fn);
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
     * @param fn
     */

    addController(fn) {
        this.controllers.push(fn);
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

        if (str.length === 0)
            return new HttpCode(204, "");

        let etag = JSON.stringify(Answerable.bodyEtag(str)),
            req_etag = this.req.headers['if-none-match'] || this.req.headers['last-modified'];

        if (etag === req_etag)
            return new HttpCode(304, "");

        return new HttpCode(200, str);
    }


    /**
     * @function sendHttpCode send client Response with an HttpCode object.
     * @param httpCode HttpCode
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
                    url = this.req.file;

                httpCode.addHeader('Connection', 'keep-alive');
                httpCode.addHeader('Content-length', body_length(body));
                httpCode.addHeader('Content-type', Answerable.getFilenameMime(url));
                httpCode.addHeader('ETag', JSON.stringify(Answerable.bodyEtag(body)));
                httpCode.addHeader('Cache-control', 'public, max-age=120');
                httpCode.addHeader('Date', ( new Date() ).toGMTString());
                httpCode.addHeader('Expires', ( new Date(Date.now() + ( 120 * 1000 )) ).toGMTString());

                this.res.writeHead(code, title, httpCode.getHeaders());
                this.res.end(body);
                return this;
            }
            else if (code === 307 || code === 308) {

                let body = httpCode.getMessage();
                httpCode.addHeader('Location', body);

                this.res.writeHead(code, title, httpCode.getHeaders());
                this.res.end(body);
                return this;
            }
            else {

                let body = await httpCode.getContent(this.req, this.res);
                httpCode.addHeader('Content-length', body_length(body));
                httpCode.addHeader('Content-type', Answerable.getFilenameMime(this.req.file));

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
        if (req instanceof IncomingMessage && res instanceof ServerResponse) {
            let a = new Amonite(req, res);
            a.configurations = this.configurations.slice();
            a.controllers = this.controllers.slice();
            return a;
        }
        else {
            throw new Error("Bad arguments");
        }
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
        let http = await this.getHttpCode(res);
        await this.sendHttpCode(http);
    }
}

module.exports = Amonite;