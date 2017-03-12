'use strict';

const Reader = require('./lib/reader.js');

var config = require('./lib/config.js')('config.ini').config;


var reader = new Reader(config);

reader.load(config.filepath);
