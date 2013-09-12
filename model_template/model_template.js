'use strict';

module.exports = function($mongoose){
	var Schema = $mongoose.Schema;
	var ObjectId = Schema.ObjectId;

	var <%= name %>Schema = new Schema({
		updateAt:   		  {type: Date, default: Date.now},
		createAt:      		  {type: Date, default: Date.now},
	});
	$mongoose.model('<%= bname %>', <%= name %>Schema); 
}
