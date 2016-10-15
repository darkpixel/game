#!/usr/bin/env node

var exports = module.exports = {};

var os = require('os');
var fs = require('fs');
var colors = require('colors/safe');
var world = require('./world.json');
var tile_types = require('./data/tile_types.json');
var debug = require('debug')('worldlib');

module.exports.saveData = function(fname, json_data) {
  // Takes a filename and a JSON.stringify-able object and saves it.  A '.json' extension will be automatically added
  // to the fname.  This will be handy if we decide to change game data paths at some point.  CWD sorta sucks.
  // Returns true if the data was save and something that evaluates to false if it failed.
  var fn = './' + fname + '.json';
  debug('Saving data to ' + fn);
  fs.writeFileSync(fn, JSON.stringify(json_data, null, 2));
  return true;
};

module.exports.loadData = function(fname) {
  // See comments in saveData()
  // Loads data from a file that can be JSON.parse'd
  var fn = './' + fname + '.json';
  debug('Loading data from ' + fn);
  return JSON.parse(fs.readFileSync(fn));
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

module.exports.getView = function (themap, x, y, visibility) {
  // Accepts a copy of the map, curent x and y coordinates along with an optional visibility distance around you
  // and returns a small x/y array of tiles to display.  Visibility is optional and defaults to 3 tiles.
  // This returns only the map tiles in the visibility range.  It also adds a 'colorized' property to each tile
  // that can be written directly to the console to display the tile in the proper color.

  var view = {};
  var view_x = 0;
  var view_y = 0;

  debug('getView called with X: ' + x + ' Y: ' + y + ' vis: ' + visibility);

  var viz = visibility || 3;

  debug('Corrected visibility: ' + viz);

  for (var yv = y - viz; yv <= y + viz; yv++) {
    for (var xv = x - viz; xv <= x + viz; xv++) {
      if (!view[view_x]) {
        view[view_x] = {};
      }
      if (!view[view_x][view_y]) {
        view[view_x][view_y] = {};
      }
      if (xv >= 0 && yv >= 0 && xv <= Object.keys(themap).length - 1 && yv <= Object.keys(themap[0]).length - 1) {
        view[view_x][view_y] = themap[xv][yv];
        view[view_x][view_y].colorized = colors[themap[xv][yv].color](themap[xv][yv].display);
      } else {
        view[view_x][view_y] = {};
      }
      view_x++;
    }
    view_y++;
    view_x = 0;
  }
  debug('Returning view with dimensions ' + Object.keys(view).length + 'x' + Object.keys(view[0]).length);
  return view;
};
