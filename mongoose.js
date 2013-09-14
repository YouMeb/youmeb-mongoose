'use strict';

var fs = require('fs');
var path = require('path');
//var colors = require('colors');
var mongoose = require('mongoose');

module.exports = function ($youmeb, $prompt, $generator,$injector) {
    $youmeb.on('help', function (command, data, done) {
        data.commands.push(['generate:mongoose-model', '', 'Generates a mongoose model']);
        data.commands.push(['delete:mongoose-model', '', 'Delete a mongoose model']);
        data.commands.push(['backup:mongoose-model', '', 'Backup your mongoose model setting']);
        data.commands.push(['insert:mongoose-model', '', 'Batch insert your old mongoose model setting']);
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
          //console.log(result);
            
          //read model.config.json

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
  $youmeb.on('cli-delete:mongoose-model', function (parser, args, done) {
    console.log('Please input you want to delete model name:');
    $prompt.get([
          {
            name: 'modelname',
            type: 'string'
          }
        ], function (err, result) {
          //console.log(result)
          if (err) {
            return done(err);
          }
          fs.unlink($youmeb.root+'/models/'+result.modelname+'.js', function (err) {
            if (err) throw err;
            console.log('successfully deleted /tmp/hello');
          });
    })
  })
  // older file(model) batch insert
  $youmeb.on('cli-insert:mongoose-model', function (parser, args, done) {
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
  $youmeb.on('cli-backup:mongoose-model', function (parser, args, done) {
    
  })
  //  
  
  var _dburl = $youmeb.config.get('mongoDBurl');
  var _model = $youmeb.config.get('models');
  //console.log(_model);
  //todo   detect heroku (process.env setting)
  var mongooseStatus ={
    //  reset model/index.js
    // setconfig:function(){

    // },
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
      if(!_model){
          console.log('Please setting your model path on '+$youmeb.root+'/config/default.json, like "models":"models"');
      }else{
          require(path.join($youmeb.root, _model, 'index.js'))(mongoose,$youmeb);    
      }
    }
  }
  //$injector.register('startmongoose',mongooseStatus);
  //detect models/index.js
  this.on('init', function (config, done) {
      $injector.register('mongoose',mongoose);
      if ($youmeb.isCli) {
          return done();
      }
      fs.readFile($youmeb.root+'/models/index.js',function(err,resault){
          if(err){
            mongooseStatus.mkdir();
          }
          mongooseStatus.connect();
          done();
      })
  })

}