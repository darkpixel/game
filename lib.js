var exports = module.exports = {};

var os = require('os');
var fs = require('fs');
var colors = require('colors/safe');
var debug = require('debug')('lib');

module.exports.saveData = function(fname, json_data) {
  // Takes a filename and a JSON.stringify-able object and saves it.  A '.json' extension will be automatically added
  // to the fname.  This will be handy if we decide to change game data paths at some point.  CWD sorta sucks.
  // Returns true if the data was save and something that evaluates to false if it failed.
  var fn = './userdata/' + fname + '.json';
  debug('Saving data to ' + fn);
  fs.writeFileSync(fn, JSON.stringify(json_data, null, 2));
  return true;
};

module.exports.loadDefs = function(fname) {
  var fn = './data/' + fname + '.json';
  debug('Loading def from ' + fn);
  return JSON.parse(fs.readFileSync(fn));
};

module.exports.loadData = function(fname) {
  // See comments in saveData()
  // Loads data from a file that can be JSON.parse'd
  var fn = './userdata/' + fname + '.json';
  debug('Loading data from ' + fn);
  try {
    return JSON.parse(fs.readFileSync(fn));
  } catch (err) {
    debug('Error loading file ' + fname + ': ' + err);
    return null;
  }
};

module.exports.getRandom = function(min_val, max_val) {
  // Gets a random value between min_val and max_val inclusive.
  debug('Getting a random value between ' + min_val + ' and ' + max_val);
  var min = Math.ceil(min_val);
  var max = Math.floor(max_val);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports.getRandomObject = function(object_list) {
  // Returns a random key from a dictionary object
  var random_object_number = module.exports.getRandom(0, Object.keys(object_list).length - 1);
  return object_list[Object.keys(object_list)[random_object_number]];
};

module.exports.getRandomArray = function(object_list) {
  // Returns a random element from an array
  var random_array_number = module.exports.getRandom(0, object_list.length - 1);
  return object_list[random_array_number];
};
