'use strict';

const util = require('util');

const targets = {};


function targetFactory(type, opts){
    var instance = null;
    console.log('load module: ' + type);
    if (typeof targets[type] == 'undefined') {
	targets[type] = require(type);
    }
    if (opts.url) {
	console.log('creating target');
	instance = new targets[type](opts);
    }
    return instance;
}


module.exports = Poster;

function Poster(opts) {
    console.log('call: Poster()');

    this.running = false;
    this.size = 0;
    this.stream = null;
    this.target = targetFactory(opts.module || './target-rest.js', opts || {});
    this.loops = 0;
    this.requests = 0;

};


Poster.prototype.getTarget = function() {
    return this.target;
}

Poster.prototype.start = function() {
    if (this.target != null) {
	console.log('poster::start() start');

	this.running = true;

	this.target.init();

	this.loop();
	console.log('poster::start() end');
    }
}


Poster.prototype.loop = function() {
//    console.log('poster::loop() start');

    this.loops++;

    var poster = this;
    var target = this.target;

    var cb = function() {
	poster.size--;
//*	
        if (poster.size <= 0) {
            console.log('restart: ' + poster.requests + ' requests and ' + poster.loops + ' loops completed');
            poster.loop();
        }
//*/

    };


    var row;
    // read loop until no data available or queue filled up
    while( this.size < 16*32 && (row = this.stream.read())!== null ) {
	this.size++;
	this.requests++;
	// console.log('.', row);
	this.target.post(row, cb);
	// cb();
    }
//    console.log('poster::loop() end');
}


Poster.prototype.setStream = function(stream) {
    var count = 0;
    var poster = this;

    if (this.target == null) {
	console.log('ERR: no valid target - missing url');
	return false;
    }
//    var input = this.input;
    stream.on('readable', function(){
	//    var row = transformer.read();
	//    var size = poster.post(row);
	count++;
	console.log('readable:: ' + count , ' loops: ' + poster.loops, 'stream:' + stream.count);

	if (poster.running == false) {
	    console.log('readable:: start');
	    //setTimeout(function() {
		poster.start();
	    //}, 1500);
	} else {
	//    if (input.isRunning) {
	//	console.log('reenter loop');
	//    }
	}
    });

    this.stream = stream;
    return true;
};
