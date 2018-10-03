const AmoniteBuilder = require('../amonite-builder');
const server = (new AmoniteBuilder()).server({"port": 8000, "folder": __dirname + "/files","cacheDuration":0});
