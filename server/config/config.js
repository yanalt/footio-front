var env = process.env.NODE_ENV || 'development'; //apparently NODE_ENV is adopted by almost everyone. heroku changes it to 'development' by default.
//var env = 'online';

if (env === 'development' || env === 'test' || env === 'online') {
  var config = require('./config.json');
  var envConfig = config[env]; //if env==='test' then the matching object from the JSON will be loaded. same with 'development'.

  Object.keys(envConfig).forEach((key) => { //Object.keys turns envConfig into an array, and in our case: ['PORT','MONGODB_URI'].
    process.env[key] = envConfig[key]; //this goes through process.env and changes values to their matching envConfig keys.
    //for example process.env['PORT']=envConfig['PORT'] which means process.env['PORT']=80 in both local cases.
  });
}

//for linux, please change "test" in package.json with the following line
//"test": "export NODE_ENV=test || SET NODE_ENV=test && mocha server/**/*.test.js",