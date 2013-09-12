'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function($mongoose,$youmeb){
	fs.readdirSync($youmeb.root+'/models').forEach(function (filename) {
	  if (filename === 'index.js' || !/^[^\.].*\.js$/.test(filename)) {
	    return;
	  }
	  console.log('  -  ' + filename);
	  require(path.join($youmeb.root+'/models', filename))($mongoose);
	});
}

