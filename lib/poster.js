'use strict';

const http = require('http');
const request = require('request');

const util = require('util');

module.exports = Poster


function Poster(baseurl) {
    console.log('call: Poster()');
//    var opts = { keepAlive: true };
    var opts = { keepAlive: true , maxSockets:1};
//    var opts = { maxSockets:8};
    this.pool = new http.Agent(opts);
    this.size = 0;
    this.posted=0;
    this.stream=null;
    this.running = false;

    this.baseUrl = baseurl;
    this.keycolumn = 'id';
    this.mode = 'create';
    this.type = '';
};

Poster.prototype.start = function() {
    console.log('poster::start() start');

    console.log('mode: ', this.mode);
    console.log('key: ', this.keycolumn);

    this.running = true;
    this.loop();
    console.log('poster::start() end');
}

Poster.prototype.loop = function() {
    console.log('poster::loop() start');
    var row;
    while( this.size < 8 && (row = this.stream.read())!== null ) {
	this.post(row);
    }
    console.log('poster::loop() end');
}


Poster.prototype.setMode = function(mode) {
    console.log('setmode:', mode);
    this.mode = mode || 'create';
    console.log('modeset:', this.mode);

}

Poster.prototype.setKeyColumn = function(name) {
    this.keycolumn = name;
}

Poster.prototype.setType = function(name) {
    this.type = name;
}


Poster.prototype.post = function(record){

//    console.log('.');
//    console.log(new Date().getTime(),record);
//    console.log(JSON.stringify(record));

//*
    var _this = this;
    var req = request(
	this.getRequestOpts(record, (this.mode == 'upsert')?'update':this.mode) ,
	function(error, response, body) {
	    if(error) console.log(error);
	    _this.posted++;
	    _this.size--;
	    // console.log(util.inspect(response, { showHidden: true, depth: 0 }));

		console.log('HTTP-Error:', response.statusCode);
		// console.log('Resp:', body);
	    if (response.statusCode == 200 ) {

		// var data = JSON.parse(body);
		if (_this.mode == 'upsert' && body.length == 0) {
		    console.log('try create....');
		    var req = request(
    			_this.getRequestOpts(record, 'create') ,
    			function(error, response, body) {
			    console.log('2nd Req: ' + response.statusCode);
			    if(error) console.log(error);
			    // _this.posted++;
			    // _this.size--;
			    if (_this.size <= 0) {
				console.log('restart');
				_this.loop();
			    }
			}
		    );
		}
	    }

	    if (_this.size <= 0) {
		console.log('restart');
		_this.loop();
	    }
	}
    );

    this.size++;
//    console.log(util.inspect(this.pool.requests, { showHidden: true, depth: 1 }));
    return this.size;
//*/
};

Poster.prototype.getUrl = function(record) {
    var params = '';
    if (this.mode != 'create') {
	params = '?' + this.keycolumn + '=' + record[this.keycolumn];
    }
    return this.baseUrl + this.type + '/' + params;
}

Poster.prototype.getRequestOpts = function(record, mode) {
    var opts = {
	uri: this.getUrl(record),
	method: "PATCH",
	json: true,
	headers: {
	    "Content-Type": "application/json",
	},
	timeout: 5000,
	agent: this.pool,
	body: record
    };
    if (mode == 'create') {
	opts.method = 'POST';
    } else {
	opts.method = 'PATCH';
    }
//    console.log('opts: ', opts);
    return opts;
}


Poster.prototype.getSize = function() {
    return this.size;
};

Poster.prototype.setStream = function(stream){
    var count = 0;
    var poster = this;
//    var input = this.input;
    stream.on('readable', function(){
	//    var row = transformer.read();
	//    var size = poster.post(row);
	count++;
	console.log('readable:: ' + count , 'read:'+ stream.bytesRead, 'size: ' + poster.getSize());

	if (poster.running == false) {
	    console.log('readable:: start');
	    poster.start();
	}
    });

    this.stream = stream;
};
