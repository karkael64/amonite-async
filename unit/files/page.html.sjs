const Document = require('../../document');
const Component = require('../../component');
const HttpCode = require('http-code-async');
const Bson = require('bson-async');

HttpCode.DEBUG_MODE = true;

class Log extends Bson {
}

Bson.FOLDER = __dirname + '/';

class Nav extends Component {

    async onCall(req) {
        if (req.arguments.get('add')) {
            let log = new Log({"date": Date.now()});
            await log.save();
        }

        let rows = [];
        await Log.select(rows.push.bind(rows));

        let httpCode = new HttpCode(200, JSON.stringify(rows, false, 4));
        httpCode.setHeader('Content-Type', 'application/json');
        throw httpCode;
    }

    getHTML() {

        return `
            <nav>
                <ul>
                    <li>Accueil</li>
                    <li>Info</li>
                    <li>Contacts</li>
                </ul>
            </nav>`;
    }
}


class Page extends Document {

    async getHTML(req, res) {

        return `<!doctype html>
<html>
<head>
<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <link rel="stylesheet" href="./login.css">
</head>
<body>
    <script src="./common.js"></script>
    <script src="./define.js"></script>
    <h1>Title</h1>
    ${await (new Nav).getContent(req, res)}
</body>
</html>`;
    }
}

module.exports = new Page;