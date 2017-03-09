
'use strict';

const fs = require('fs');
const ini = require('ini');


module.exports = function(filename) {
    return new Config(filename);
};

var Config = function (filename){
    this.config = ini.parse(fs.readFileSync(filename, 'utf-8'));
};
