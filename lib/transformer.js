

const Transform = require('stream').Transform;

class Transformer extends Transform {

    constructor(options) {
	super(options);
	this.count = 0;
	this.filter = null;
    }

    setFilter(keys) {
	this.filter = keys;
    }

    _transform(input, encoding, callback) {
//    console.log('data',input);
	var output = input;
	if (this.keys) {
	    output = this.filter.reduce(
		function (accum, key) {
		    accum[key] = input[key];
		    return accum;
		},
		{}
	    );
	}
	this.count++;
	// output.id = this.count;

	this.push(output);
	callback();
    }
}


module.exports = function(options) {
    return new Transformer(options);
}
