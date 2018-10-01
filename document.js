const HttpCode = require('http-code-async'),
    Answerable = HttpCode.Answerable,
    Error = HttpCode.Error;

function is_function(el) {
    return (typeof el === 'function');
}

function is_string(el) {
    return (typeof el === 'string');
}


class Document extends Answerable {

    constructor() {
        super();
        if (!is_function(this.getHTML))
            throw new Error("This instance of Document has no getHTML method!");
    }


    /**
     * @method <getContent> call the component if present in args, then get string of getHTML() and returns it wrapped.
     * @param req {http.IncomingMessage}
     * @param res {http.ServerResponse}
     * @returns {Promise.<string>}
     */

    async getContent(req, res) {
        let body = await this.getHTML(req, res);
        if (!is_string(body)) {
            throw new Error("Document.getHTML should return a string.");
        }
        else {
            return body;
        }
    }
}

module.exports = Document;
