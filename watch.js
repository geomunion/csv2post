
'use strict';

const sane = require('sane');

const Reader = require('./lib/reader.js');

var config = require('./lib/config.js')('config.ini').config;


var reader = new Reader(config);

var invoke = function(filepath) {
    if (reader.isRunning == false ) {
	reader.load(filepath);
    } else {
	console.log('already running');
    }
}

var files = [];
for (var i in config.watcher.files) {
    files.push(config.watcher.files[i]);
}
// console.log(files);
// var watcher = sane('path/to/dir', {glob: ['**/*.js', '**/*.css']});
var watcher = sane(config.watcher.baseDir, {glob: files});

watcher.on('ready', function () { console.log('ready') });

watcher.on('change', function (filepath, root, stat) {
    console.log('file changed', root + '/' + filepath);
    invoke( root + '/' + filepath );
});

watcher.on('add', function (filepath, root, stat) {
    console.log('file added', filepath);
    invoke( root + '/' + filepath );
});

watcher.on('delete', function (filepath, root) {
    console.log('file deleted', filepath);
});

// close
// watcher.close();