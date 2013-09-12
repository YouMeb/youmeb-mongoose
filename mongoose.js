'use strict';

var fs = require('fs');
var path = require('path');
//var colors = require('colors');
var mongoose = require('mongoose');

module.exports = function ($youmeb, $prompt, $generator,$injector) {
    $youmeb.on('help', function (command, data, done) {
        data.commands.push(['generate:mongoose-model', '', 'Generates a mongoose model']);
        done();
    });
    // generate a model
    $youmeb.on('cli-generate:mongoose-model', function (parser, args, done) {
        //fetch new model name and path
        $prompt.get([
          {
            name: 'name',
            type: 'string'
          }
        ], function (err, result) {
          if (err) {
            return done(err);
          }
          console.log(result);
          //creat on model folder
          var generator  = $generator.create();
          var _tmpname = result.name.split('');
          var bname = '';

          generator.source = path.join(__dirname, 'model_template');
          generator.destination = path.join($youmeb.root, $youmeb.config.get('models'));
          _tmpname[0] = _tmpname[0].toUpperCase();
          for (var i = 0;i < _tmpname.length; i++) {
            bname += _tmpname[i];
          };
          
          generator.createFile('./model_template.js', './' + result.name + '.js', {
            name: result.name,
            bname: bname
          }, function () {
              console.log('create a model success!');
          });
        
        });
  });
  // delete a model
  $youmeb.on('cli-generate:mongoose-model-delete', function (parser, args, done) {
    $prompt.get([
          {
            name: 'You want to delete model name',
            type: 'string'
            //default: 'example.home'
          }
        ], function (err, result) {
          if (err) {
            return done(err);
          }
    })
  })
  // log recard

  // older file(model) batch insert
  $youmeb.on('cli-generate:mongoose-model-batchinsert', function (parser, args, done) {
      $prompt.get([
          {
            name: 'You want to delete model name',
            type: 'string'
            //default: 'example.home'
          }
        ], function (err, result) {
          if (err) {
            return done(err);
          }
      })
  })
  //Backup origin model info
  $youmeb.on('cli-generate:mongoose-model-backup', function (parser, args, done) {
  })
  //  
  $injector.register('mongoose',mongoose);

  //todo   detect heroku (process.env setting)
  var _dburl = $youmeb.config.get('mongoDBurl');
  var _model = $youmeb.config.get('models');
  var mongooseStatus ={
    mkdir:function(){
      fs.mkdir($youmeb.root+'/models', '0777', function(err,resault){
        if(err){
          console.log('Sorry,'+err);
        }else{
          var generator  = $generator.create();
          generator.source = path.join(__dirname, 'model_template');
          generator.destination = path.join($youmeb.root, _model);
          generator.createFile('./index.js', './index.js', {}, function () {
            console.log('init model success!');
          });
        }
      })
    },
    connect:function(){
      mongoose.connect(_dburl, function (err, res) {
          if (err) { 
            console.log ('Sorry! ERROR connecting to MongoDB: ' + _dburl + '. ' + err);
            console.log ('Please Check your mongoDB url!');
          } else {
            console.log ('Succeeded connected to MongoDB: ' + _dburl);
          }
      });
      require(path.join($youmeb.root, _model, 'index.js'))(mongoose,$youmeb);
    }
  }
  //detect models/index.js
  fs.readFile($youmeb.root+'/models/index.js',function(err,resault){
      if(err){
        mongooseStatus.mkdir();
      }
      mongooseStatus.connect()
  })
}