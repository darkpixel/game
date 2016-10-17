#!/usr/bin/env node

var os = require('os');
var colors = require('colors/safe');
var blessed = require('blessed');
var bc = require('blessed-contrib');
var lib = require('./lib');
var worldlib = require('./worldlib');
var debug = require('debug')('worldedit');

var my_x = 0;
var my_y = 0;
var my_sight = 5;

var world = lib.loadData('world');
var tile_types = lib.loadDefs('tile_types');

if (!world) {
  console.log('There is no world to edit.  Perhaps you want to run worldgen?');
  return;
}

var screen = blessed.screen({
  smartCSR: true,
  dockBorders: false,
  autoPadding: true,
  debug: true
});

var grid = new bc.grid({rows: 24, cols: 12, screen: screen});

var mapbox = grid.set(0, 0, 8, 2, blessed.text, {
  label: '| ' + world.name + ' |'
});

var tlog = grid.set(0, 2, 7, 5, blessed.text, {
  label: '| Terrain |'
});

var slog = grid.set(0, 7, 7, 5, blessed.text, {
  label: '| Status |'
});

var cmdlog = grid.set(7, 2, 1, 10, blessed.textbox, {
  label: '| CMD |',
  cursor: 'block',
  keys: false,
  cursorBlink: true,
  focused: true
});

var key_list = {};

for (var i = 0; i <= Object.keys(tile_types).length - 1; i++) {
  key_list[i] = {};
  key_list[i].fn = wrap_change_tile(tile_types[Object.keys(tile_types)[i]]);
  key_list[i].name = tile_types[Object.keys(tile_types)[i]].name;
}

cmdlog.on('keypress', function (ch, key) {
  switch (key.name) {
    case 'return':
      break;
    case 'enter':
      break;
    case 'left':
      if (my_x <= 0) {
        my_x = 0;
      } else {
        my_x--;
      }
      cmdlog.content = '';
      return renderMap(world.map, my_x, my_y, my_sight);
    case 'right':
      if (my_x >= Object.keys(world.map).length - 1) {
        my_x = Object.keys(world.map).length - 1;
      } else {
        my_x++;
      }
      cmdlog.content = '';
      return renderMap(world.map, my_x, my_y, my_sight);
    case 'up':
      if (my_y <= 0) {
        my_y = 0;
      } else {
        my_y--;
      }
      cmdlog.content = '';
      return renderMap(world.map, my_x, my_y, my_sight);
    case 'down':
      if (my_y >= Object.keys(world.map[0]).length - 1) {
        my_y = Object.keys(world.map[0]).length - 1;
      } else {
        my_y++;
      }
      cmdlog.content = '';
      return renderMap(world.map, my_x, my_y, my_sight);
    default:
      cmdlog.content += ch;
  }

  switch (cmdlog.content) {
    case 's':
      cmdlog.content = 'save';
      screen.debug('save triggered');
      lib.saveData('world', world);
      screen.debug('save complete');
      cmdlog.content = '';
      break;
    case 'l':
      cmdlog.content = 'load';
      screen.debug('load triggered');
      world = lib.loadData('world');
      screen.title = world.name;
      screen.debug('load complete');
      cmdlog.content = '';
      my_x = 0;
      my_y = 0;
      renderMap(world.map, my_x, my_y, my_sight);
      break;
    case 'q':
      cmdlog.content = 'quit';
      lib.saveData('world', world);
      debuglog.log('Escape or CTRL+C pressed');
      cmdlog.content = '';
      screen.destroy();
      break;
    case '?':
      cmdlog.content = 'help';
      for (var ii = 0; ii < Object.keys(key_list).length - 1; ii++) {
        debuglog.log(ii + ': ' + key_list[ii].name);
      }
      cmdlog.content = '';
      break;
    default:
      // Check to see if there is more than one command we could be matching
      // If not, attempt to execute the command immediately
      if (!Object.keys(key_list).some(testPartialCommand) || key.name === 'enter' || key.name === 'return') {
        if (key_list[cmdlog.content]) {
          key_list[cmdlog.content].fn();
          cmdlog.content = '';
        } else {
          if (!cmdlog.content.length === 0) {
            debuglog.log('Invalid command: ' + cmdlog.content);
          }
          cmdlog.content = '';
        }
      }
      renderMap(world.map, my_x, my_y, my_sight);
  }
});

function testPartialCommand(item, index, array) {
  try {
    var cmdregexp = new RegExp('^' + cmdlog.content + '[^$]');
    return cmdregexp.test(item);
  } catch (err) {
    return false;
  }
}

var debuglog = grid.set(8, 0, 16, 12, blessed.log, {
  label: '| Log |',
    scrollOnInput: true
});

function wrap_change_tile(tile_type) {
  return function(ch, key) {
    world.map[my_x][my_y] = tile_type;
    renderMap(world.map, my_x, my_y);
  };
}

function renderMap(themap, map_x, map_y) {
  var view = worldlib.getView(themap, map_x, map_y, 10);
  var box_data = '';

  for (var y = 0; y <= Object.keys(view).length - 1; y++) {
    for (var x = 0; x <= Object.keys(view[y]).length - 1; x++) {
      if (view[x][y].colorized) {
        box_data += view[x][y].colorized;
      } else {
        box_data += '  ';
      }
    }
    box_data += os.EOL;
  }
  mapbox.content = box_data;
  var my_tile = worldlib.getTileData(themap, map_x, map_y);
  tlog.content = '> ' + my_tile.name + ' <';
  screen.render();
}

cmdlog.key(['escape', 'C-c'], function(ch, key) {
  lib.saveData('world', world);
  debuglog.log('Escape or CTRL+C pressed');
  return screen.destroy();
});

screen.title = world.name;
renderMap(world.map, my_x, my_y, my_sight);
screen.render();
