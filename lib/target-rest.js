'use strict';

const http = require('http');
const request = require('request');

module.exports = Rest;

function Rest(opts) {
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


Rest.prototype.init = function() {

	console.log('Rest baseUrl: ', this.baseUrl);
	console.log('Rest type: ', this.type);

	console.log('Rest mode: ', this.mode);
	console.log('Rest key: ', this.keycolumn);
}

Rest.prototype.getUrl = function(record) {
    var params = '';
    if (this.mode != 'create') {
        params = '?' + this.keycolumn + '=' + record[this.keycolumn];
    }
    return this.baseUrl + this.type + '/' + params;
}

Rest.prototype.getRequestOpts = function(record, mode) {
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


Rest.prototype.post = function(record, cb){

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
            // _this.size--;
	    
            // console.log(util.inspect(response, { showHidden: true, depth: 0 }));

            //    console.log('HTTP-Error:', response.statusCode);
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

			    cb();
                            // _this.size--;
//                            if (_this.size <= 0) {
//                                console.log('restart');
//                                _this.loop();
//                            }
                        }
                    );
                }
            }
	    cb();
//            if (_this.size <= 0) {
//                console.log('restart');
//                _this.loop();
//            }
        }
    );

    this.size++;
//    console.log(util.inspect(this.pool.requests, { showHidden: true, depth: 1 }));
    return this.size;
//*/
};
