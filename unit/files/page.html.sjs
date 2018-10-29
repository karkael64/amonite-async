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
                <li>Informations</li>
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
    <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci aliquid amet aut est excepturi facilis illo, laudantium magnam molestiae molestias nemo possimus provident recusandae repudiandae sunt tenetur ullam veniam voluptatem. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa cum incidunt laudantium possimus veniam voluptas! Aliquam aliquid animi, architecto at doloribus illo ipsa itaque molestias nesciunt quasi quidem quis unde.
    </p>
    <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci aliquid amet aut est excepturi facilis illo, laudantium magnam molestiae molestias nemo possimus provident recusandae repudiandae sunt tenetur ullam veniam voluptatem. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa cum incidunt laudantium possimus veniam voluptas! Aliquam aliquid animi, architecto at doloribus illo ipsa itaque molestias nesciunt quasi quidem quis unde.
    </p>
    <form action="">
        <dropdown count="multiple">
            <checkbox name="1">Lorem ipsum lorem ipsum lorem.</checkbox>
            <checkbox name="2" value="true">Your</checkbox>
            <checkbox name="3">It</checkbox>
            <checkbox name="4" value="false">Them</checkbox>
            <checkbox name="5" value="false">Their</checkbox>
            <checkbox name="6" value="null">Our</checkbox>
            <checkbox name="7" value="false">My</checkbox>
            <checkbox name="8" value="true">Its</checkbox>
            <checkbox name="9" value="true">Your</checkbox>
            <checkbox name="10">It</checkbox>
            <checkbox name="11" value="false">Them</checkbox>
            <checkbox name="12" value="false">Their</checkbox>
            <checkbox name="13" value="null">Our</checkbox>
            <checkbox name="14" value="false">My</checkbox>
            <checkbox name="15" value="true">Its</checkbox>
            <checkbox name="16" value="null">Our</checkbox>
            <checkbox name="17" value="false">My</checkbox>
            <checkbox name="18" value="true">Its</checkbox>
            <checkbox name="19" value="true">Your</checkbox>
        </dropdown>
        <autocomplete name="test" resource-uri="/autocomplete.json"></autocomplete>
        <hour-digital></hour-digital>
    </form>
    <year></year>
</body>
</html>`;
    }
}

module.exports = new Page;
