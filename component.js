const HttpCode = require('http-code-async'),
    Answerable = HttpCode.Answerable,
    Error = HttpCode.Error;

function is_function(el) {
    return (typeof el === 'function');
}

function is_string(el) {
    return (typeof el === 'string');
}


class Component extends Answerable {

    constructor() {
        super();
        if (!is_function(this.getHTML))
            throw new Error("This instance of Component has no getHTML method!");
    }


    /**
     * @method <getContent> string of getHTML() and returns it.
     * @param req {http.IncomingMessage}
     * @param res {http.ServerResponse}
     * @returns {Promise.<string>}
     */

    async getContent(req, res) {
        let name = this.constructor.name;
        if (req.arguments.get('component') === name && is_function(this.onCall)) {
            await this.onCall(req, res);
        }
        let body = await this.getHTML(req, res);
        if (!is_string(body)) {
            throw new Error("Component.getHTML should return a string.");
        }
        return `<component name="${name}" etag="${Answerable.bodyEtag(body)}">${body}</component>`;
    }
}

module.exports = Component;