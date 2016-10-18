#!/usr/bin/env node

var exports = module.exports = {};

var os = require('os');
var colors = require('colors/safe');
var tile_types = require('./data/tile_types.json');
var debug = require('debug')('worldlib');
var prettyjson = require('prettyjson');

function getRandomIntInclusive(min_val, max_val) {
  var min = Math.ceil(min_val);
  var max = Math.floor(max_val);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports.getTileData = function(themap, x, y) {
  // Takes an x and y coordinate and returns the tile data

  return themap[x][y];
};

module.exports.getTileByType = function(type) {
  debug('Looking up tile type: ' + type);
  return tile_types[type];
};

module.exports.getTileTypeByCoord = function(themap, x, y) {
  if (y > Object.keys(themap[0]).length - 1 || y < 0) {
    return null;
  } else if (x > Object.keys(themap).length - 1 || x < 0) {
      return null;
  } else {
    return tile_types[themap[x][y].tile];
  }
};

module.exports.getView = function (themap, x, y, visibility) {
  // Accepts a copy of the map, curent x and y coordinates along with an optional visibility distance around you
  // and returns a small x/y array of tiles to display.  Visibility is optional and defaults to 3 tiles.
  // This returns only the map tiles in the visibility range.  It also adds a 'colorized' property to each tile
  // that can be written directly to the console to display the tile in the proper color.

  var view = {};
  var view_x = 0;
  var view_y = 0;
  // build a view object and the ability to track current coordinates in the view object

  debug('getView called with X: ' + x + ' Y: ' + y + ' vis: ' + visibility);
  var viz = visibility || 3;
  debug('Corrected visibility: ' + viz);

  for (var yv = y - viz; yv <= y + viz; yv++) {
    for (var xv = x - viz; xv <= x + viz; xv++) {
      // If the current view x or y coordinate does not exist, create it so we can put data in the dictionary
      if (!view[view_x]) {
        view[view_x] = {};
      }
      if (!view[view_x][view_y]) {
        view[view_x][view_y] = {};
      }

      // Check if we are in the boundaries of the actual map
      if (xv >= 0 && yv >= 0 && xv <= Object.keys(themap).length - 1 && yv <= Object.keys(themap[0]).length - 1) {
        // If we are in the boundaries of the actual map, add the map tile to the view we are returning
        Object.assign(view[view_x][view_y], themap[xv][yv]);
        var tile = module.exports.getTileByType(view[view_x][view_y].tile);

        if (xv === x && yv === y) {
          // this is our position on the map, send the tile with a bgWhite color so the user can
          // identify their location.
          view[view_x][view_y].colorized = colors[tile.color].bgWhite(tile.display);
        } else {
          // this is a square somewhere else on the map, just send the normal color
          view[view_x][view_y].colorized = colors[tile.color].bgBlack(tile.display);
        }
      } else {
        // if we are not in the boundaries of the actual map, return an empty object
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
