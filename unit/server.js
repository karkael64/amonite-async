// before

const moke = require('./mokes'), should = moke.should, assert = moke.assert;

// main

console.info("\x1b[32m", "server…", "\x1b[0m");

const amo = require('../amonite-builder');
amo.PATH = __dirname + "/files";

(function(){
    amo.server('localhost', 8000);
})();


//after

