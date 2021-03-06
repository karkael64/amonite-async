let count = 0;

function assert(el, message) {
    if (!el) {
        console.error("\x1b[1m\x1b[31m", message || "Unit test error", "\x1b[0m");
        console.trace();
        process.exitCode++;
    }
    count++;
}

function should(el, be, message) {
    if (el !== be) {
        console.error("\x1b[1m\x1b[31m", message || "Unit test error", "\x1b[0m");
        console.trace();
        process.exitCode++;
    }
    count++;
}

async function returns(fn, be, message) {
    if (!(typeof fn === 'function')) {
        console.error("\x1b[1m\x1b[31m", message || "Unit test error: first parameter not a function", "\x1b[0m");
        console.trace();
        process.exitCode++;
    }
    else {

        let el;
        try {
            el = await fn();
        }
        catch (err) {
            console.warn("\x1b[1m\x1b[31m", message || "Unit test error: function thrown unexpected error", "\x1b[0m");
            console.trace();
            process.exitCode++;
        }

        if (el !== be) {
            console.warn("\x1b[1m\x1b[31m", message || "Unit test error", "\x1b[0m");
            console.trace();
            process.exitCode++;
        }
    }
    count++;
}

async function throws(fn, be, message) {
    if (!fn || !(fn instanceof Function)) {
        console.warn("\x1b[1m\x1b[31m", message || "Unit test error: first parameter not a function", "\x1b[0m");
        console.trace();
        process.exitCode++;
    }
    else {

        let el = null;
        try {
            await fn();
        }
        catch (el) {
        }

        if (el && !be && (el === be) && !(el instanceof be)) {
            console.warn("\x1b[1m\x1b[31m", message || "Unit test error", "\x1b[0m");
            console.trace();
            process.exitCode++;
        }
    }
    count++;
}

function stub(into, field, stub) {
    let std = into[field];
    into[field] = stub;
    into[field].revert = function () {
        into[field] = std;
    };
}

class IncomingMessage {
    constructor(method, url, headers, body) {
        this.method = method || "GET";
        this.url = url || ".";
        this.headers = headers || {};
        this.data = body || ["chunk1", "chunk2", "last_chunk"];
    }

    on(ev, fn) {

        if (ev === 'data') {
            let body = this.data.slice();
            while (body.length) {
                fn(Buffer.from(body.shift()));
            }
        }
        if (ev === 'end') {
            fn();
        }

    }
}

IncomingMessage.prototype.connection = {
    destroy: function () {
    }
};

class ServerResponse {
    writeHead(code, title, headers) {
        this.code = code;
        this.title = title;
        this.headers = headers
    }

    end(body) {
        this.body = body;
    }
}

function createServer(fn) {
    return {
        listen: function (options, callback) {
            this.options = options;
            if (callback) setTimeout(callback, 10);
        },
        testRequest: function (req) {
            fn(req, new ServerResponse());
        },
        close: function () {
        }
    }
}

module.exports = {
    'assert': assert,
    'should': should,
    'returns': returns,
    'throws': throws,
    'stub': stub,
    'IncomingMessage': IncomingMessage,
    'ServerResponse': ServerResponse,
    'createServer': createServer,
    'count': function () {
        return count;
    }
};