#!/usr/bin/env node

var os = require('os');
var colors = require('colors/safe');
var blessed = require('blessed');
var bc = require('blessed-contrib');
var lib = require('./lib');
var worldlib = require('./worldlib');
var debug = require('debug')('worldedit');
var cmdlib = require('./cmdlib');

var my_x = 0;
var my_y = 0;
var my_sight = 6;

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

var cmdlog = grid.set(7, 2, 2, 10, blessed.textbox, {
  label: '| CMD |',
  cursor: 'block',
  keys: false,
  cursorBlink: true,
  focused: true
});

cmdlib.addCommand('s', 'save', function() {
  lib.saveData('world', world);
  debuglog.log('Saved');
});

cmdlib.addCommand('l', 'load', function() {
  world = lib.loadData('world');
  screen.title = world.name;
  if (world.start_x) {
    my_x = world.start_x;
  } else {
    my_x = 0;
  }

  if (world.start_y) {
    my_y = world.start_y;
  } else {
    my_y = 0;
  }
  renderMap(world.map, my_x, my_y, my_sight);
  debuglog.log('Loaded');
});

cmdlib.addCommand('q', 'quit', function() {
  lib.saveData('world', world);
  screen.destroy();
});

cmdlib.addCommand('x', 'set start coordinates', function() {
  world.start_x = my_x;
  world.start_y = my_y;
  debuglog.log('Start coordinates set to: ' + world.start_x + 'x' + world.start_y);
});

for (var i = 0; i <= Object.keys(tile_types).length - 1; i++) {
  cmdlib.addCommand('', tile_types[Object.keys(tile_types)[i]].name, wrap_change_tile(Object.keys(tile_types)[i]));
}

function wrap_change_tile(tile_type) {
  return function(ch, key) {
    screen.debug('Setting tile to: ' + tile_type);
    world.map[my_x][my_y].type = tile_type;
  };
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
    case '?':
      cmdlog.content = 'help';
      for (var ii = 0; ii <= Object.keys(cmdlib.getCommands()).length - 1; ii++) {
        debuglog.log(Object.keys(cmdlib.getCommands())[ii] + ': ' + cmdlib.getCommands()[Object.keys(cmdlib.getCommands())[ii]].name);
      }
      cmdlog.content = '';
      break;
    default:
      // Check to see if there is more than one command we could be matching
      // If not, attempt to execute the command immediately

      if (!cmdlib.testPartialCommand(cmdlog.content) || key.name === 'enter' || key.name === 'return') {
        if (cmdlib.commandExists(cmdlog.content)) {
          cmdlib.getCommand(cmdlog.content)();
        } else if (!cmdlog.content.length === 0) {
            debuglog.log('Invalid command: ' + cmdlog.content);
        }
        cmdlog.content = '';
      }
      renderMap(world.map, my_x, my_y, my_sight);
  }
});

var debuglog = grid.set(8, 0, 16, 12, blessed.log, {
  label: '| Log |',
    scrollOnInput: true
});

function renderMap(themap, map_x, map_y, my_sight) {
  var sight = my_sight || 3;
  var view = worldlib.getView(themap, map_x, map_y, sight);
  var box_data = '';

  for (var y = 0; y <= Object.keys(view).length - 1; y++) {
    for (var x = 0; x <= Object.keys(view[y]).length - 1; x++) {
      if (view[x][y].colorized) {
        box_data += view[x][y].colorized + ' ';
      } else {
        box_data += '   ';
      }
    }
    box_data += os.EOL;
  }
  mapbox.content = box_data;
  var my_tile = worldlib.getTileByType(themap[map_x][map_y].type);
  var my_tile_name = my_tile.name;

  if (my_tile.name.length < 17) {
    for (var i = my_tile.name.length; i <= 17; i++) {
      my_tile_name += '.';
    }
  }
  tlog.content = '> ' + my_tile_name + ' <';
  screen.render();
}

cmdlog.key(['escape', 'C-c'], function(ch, key) {
  lib.saveData('world', world);
  debuglog.log('Escape or CTRL+C pressed');
  return screen.destroy();
});

if (world.start_x) {
  my_x = world.start_x;
} else {
  my_x = 0;
}

if (world.start_y) {
  my_y = world.start_y;
} else {
  my_y = 0;
}

screen.title = world.name;
renderMap(world.map, my_x, my_y, my_sight);
screen.render();
