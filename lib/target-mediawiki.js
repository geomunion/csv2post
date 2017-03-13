'use strict';

const http = require('http');
const request = require('request');

module.exports = Wiki;

function Wiki(opts) {
    console.log('Rest()', opts);

    this.size = 0;

    this.posted = 0;

    this.baseUrl = opts.url;
    this.type = opts.type || '';

    this.keycolumn = opts.keyColumn || 'id';
    this.mode = opts.mode || 'create';

//    var opts = { keepAlive: true };
//    var opts = { maxSockets:8};
    var opts = { keepAlive: true , maxSockets:8};
    this.pool = new http.Agent(opts);
};


Wiki.prototype.init = function() {

        console.log('Wiki baseUrl: ', this.baseUrl);
        console.log('Wiki type: ', this.type);

        console.log('Wiki mode: ', this.mode);
        console.log('Wiki key: ', this.keycolumn);
};

Wiki.prototype.post = function(record, cb){

//    console.log('.');
    console.log(new Date().getTime(),record);
//    console.log(JSON.stringify(record));

    var req = request(
	{ uri: this.baseUrl, method: 'GET' } ,
        function(error, response, body) {
	    cb();
	}
    );
};