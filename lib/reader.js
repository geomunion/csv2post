'use strict';

const fs = require('fs');
const parse = require('csv-parse');
const request = require('request');
const Poster = require('./poster.js');


function Reader(config){
    this.isRunning = false;

    this.config = config;

    this.input = null;
    this.parser = null;

    this.poster = new Poster(config.endpoint.url);

    // console.log(this.config);
};


Reader.prototype.load = function(filepath) {

    if (this.isRunning == false ) {
	console.log('load:' + filepath);
	this.isRunning = true;

	var filename = filepath.substring(filepath.lastIndexOf('/')+1);
	var type = filename.substring(0, filename.indexOf('.'));

	console.log('filename: ', filename);
	console.log('type: ', type);

	this.poster.setType(type);
	this.poster.setMode(this.config.mode[type]);
	this.poster.setKeyColumn(this.config.ukey[type]);

	this.input = fs.createReadStream(filepath,{highWaterMark: 16*512});

	var mapping = this.config.map || {};
	this.parser = parse({columns: columnmap(type, mapping),highWaterMark: 20});


	// Catch any error
	this.parser.on('error', function(err){
	    console.log(err.message);
	});
	var reader = this;
	this.parser.on('finish', function(){
	    console.log(this.count + ' records read');
	    reader.isRunning = false;
	    reader.poster.running = false;
	});

	this.parser.on('drain', function(){
	    console.log('parser drain');
	});

	this.poster.setStream(this.parser);

	this.input.pipe(this.parser);


    } else {
	console.log('ERR: already running');
    }
}


var columnmap = function(type, mapping){

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
