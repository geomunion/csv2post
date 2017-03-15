'use strict';

const fs = require('fs');
const parse = require('csv-parse');
const iconv = require('iconv-lite');

//const transform = require('stream-transform');
const transform = require('./transformer.js');

const Poster = require('./poster.js');


function Reader(config){
    this.isRunning = false;

    this.config = config;

    this.input = null;
    this.parser = null;

    this.poster = null;
};

Reader.prototype.initParser = function(type, opts) {
    var mapping = this.config.map || {};

    var options = {};
    if (this.config.reader) {
	options = this.config.reader.options;
    }
    Object.assign(options, opts);

    options.columns = columnmap(type, mapping);

    //console.log('parser opts', options);
    this.parser = parse(options);
};


Reader.prototype.load = function(filepath, type ) {

    if (this.isRunning == false ) {
	console.log('load: ' + filepath);
	this.isRunning = true;

	var filename = filepath.substring(filepath.lastIndexOf('/')+1);
	if ( !type ) type = filename.substring( 0, filename.indexOf('.') );

	console.log('filename: ', filename);
	console.log('type: ', type);

	var opts = {};
	if (this.config.poster && typeof this.config.poster[type] != 'undefined' ) {
	    opts = this.config.target[this.config.poster[type]];
	} else {
	    if (this.config.target.url) opts.url = this.config.target.url;
	}

	if (!opts.type) opts.type = type;
	if (!opts.mode) opts.mode = this.config.mode[type];
	if (!opts.keyColumn) opts.keyColumn = this.config.ukey[type];

	console.log('using target config: ', opts);
	this.poster = new Poster(opts);

	this.input = fs.createReadStream(filepath,{highWaterMark: 16*8*512});

	this.initParser(type, {highWaterMark: 8*4*16});


	// Catch any error
	this.parser.on('error', function(err){
	    console.log(err.message);
	});
	var reader = this;
	this.parser.on('finish', function(){
	    console.log(this.count + ' records read');
	    reader.isRunning = false;

//	    console.log(' stopping poster');
//	    reader.poster.running = false;
	});

	this.parser.on('drain', function(){
	    console.log('parser drain');
	});

	if (this.poster != null) {

	    var input = this.input;
	    var output = this.parser;

	    if ( this.config.charset ) {
	        console.log('using input charset: ', this.config.charset);
	        input = input.pipe( iconv.decodeStream(this.config.charset) );
	    }

	    if (this.config.reader.transform) {
	        console.log('using transformer: ', this.config.reader.transform);
		input = input.pipe(output);
	        output = transform({objectMode: true});
		if (this.config.map[type]) {
		    output.setFilter(Object.keys(this.config.map[type]));
		}
	    }

	    if ( this.poster.setStream(output) == true ) {
		input.pipe(output);
	    }

	} else {
	    console.log('ERR: no poster available');
	}

    } else {
	console.log('ERR: already running');
    }
}


var columnmap = function(type, mapping) {

    if (type in mapping) {

        return function(header){
            var columns = [];
            var map = {};
            for (var t in mapping[type]) {
                map[mapping[type][t]] = t;
            }
//          console.log('Header:',header);
//          console.log('Map:',map);

            for(var s in header) {

                if (map[header[s]]) {
                    columns.push(map[header[s]]);
                } else {
                    columns.push(header[s]);
                }
            }
            return columns;
        };
    }
    else {
        // set auto discovery
        return true;
    }
};

module.exports = Reader;
