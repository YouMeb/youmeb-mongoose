'use strict';

var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');

module.exports = function ($youmeb, $config, $prompt, $generator, $injector) {
  $youmeb.on('help', function (command, data, done) {
    data.commands.push(['mongoose:generate:model', '', 'Generates a mongoose model']);
    done();
  });

  var connectMongoose = function (config) {
    mongoose.connect(config.get('host') || 'localhost', config.get('db') || 'youmeb_app', config.get('port') || '27017');
  };

  this.on('init', function (config, done) {
    if ($youmeb.isCli) {
      return done();
    }

    $injector.register('mongoose', mongoose);
    
    connectMongoose(config);

    // init
    var importDir = function (dir, importDone) {
      fs.readdir(dir, function (err, files) {
        if (err) {
          return importDone(err);
        }
        var i = 0;
        var isJs = /\.js$/i;
        (function next() {
          var file = files[i++];
          if (!file) {
            return importDone(null);
          }
          if (file === 'index.js' || !isJs.test(file)) {
            return next();
          }
          file = path.join(dir, file);
          fs.stat(file, function (err, stats) {
            if (err) {
              return importDone(err);
            }
            if (stats.isFile()) {
              var wrapper = require(file);
              if (typeof wrapper === 'function') {
                wrapper(mongoose, mongoose.Schema, Schema.ObjectId);
              }
              done();
            } else {
              importDir(file, function (err) {
                if (err) {
                  return importDone(err);
                }
                next();
              });
            }
          });
        })();
      });
    };

    // mongoose.import 目錄下所有檔案
    // 最後執行 index.js，讓使用者設定關聯
    importDir(path.join($youmeb.root, config.get('modelsDir') || 'models'), function (err) {
      if (err) {
        return done(err);
      }
      var index;

      try {
        index = require(dir);
      } catch (e) {
        return done(e);
      }

      if (typeof index === 'function') {
        index(sequelize);
      }

      done(null);
    });
  });

  // generate a model
  $youmeb.on('cli-mongoose:generate:model', function (parser, args, done) {
    $prompt.get([
      {
        name: 'name',
        type: 'string',
        required: true
      }
    ], function (err, result) {
      if (err) {
        return done(err);
      }

      var generator = $generator.create(path.join(__dirname, 'templates'), path.join($youmeb.root, $config.get('mongoose.modelsDir') || 'models'));

      generator.on('create', function (file) {
        console.log();
        console.log('  create '.yellow + file);
        console.log();
      });

      generator.createFile('./model.js', './' + result.name + '.js', {
        name: result.name.toLowerCase()
      }, done);
    });
  });

};
