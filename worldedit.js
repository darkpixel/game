#!/usr/bin/env node

var os = require('os');
var colors = require('colors/safe');
var blessed = require('blessed');
var bc = require('blessed-contrib');
var lib = require('./lib');
var worldlib = require('./worldlib');

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

function watch_for_command() {
  cmdlog.readInput(function(err, data) {
    cmdlog.clearInput();
    if (err) {
      debuglog.log(err);
    } else {
      if (data === 'q') {
        lib.saveData('world', world);
        return screen.destroy();
      } else {
        debuglog.log(data);
        watch_for_command();
      }
    }
  });
}
watch_for_command();

var debuglog = grid.set(8, 0, 16, 12, blessed.log, {
  label: '| Log |'
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
}

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  lib.saveData('world', world);
  return screen.destroy();
});

screen.key('left', function(ch, key) {
  if (my_x <= 0) {
    my_x = 0;
  } else {
    my_x--;
  }
  renderMap(world.map, my_x, my_y, my_sight);
});

screen.key('right', function(ch, key) {
  if (my_x >= Object.keys(world.map).length - 1) {
    my_x = Object.keys(world.map).length - 1;
  } else {
    my_x++;
  }
  renderMap(world.map, my_x, my_y, my_sight);
});

screen.key('up', function(ch, key) {
  if (my_y <= 0) {
    my_y = 0;
  } else {
    my_y--;
  }
  renderMap(world.map, my_x, my_y, my_sight);
});

screen.key('down', function(ch, key) {
  if (my_y >= Object.keys(world.map[0]).length - 1) {
    my_y = Object.keys(world.map[0]).length - 1;
  } else {
    my_y++;
  }
  renderMap(world.map, my_x, my_y, my_sight);
});

screen.key('s', function(ch, key) {
  screen.debug('save triggered');
  lib.saveData('world', world);
  screen.debug('save complete');
});

screen.key('l', function(ch, key) {
  screen.debug('load triggered');
  world = lib.loadData('world');
  screen.title = world.name;
  screen.debug('load complete');
  my_x = 0;
  my_y = 0;
  renderMap(world.map, my_x, my_y, my_sight);
});


var terrain_key_list = {};

for (var i = 0; i <= Object.keys(tile_types).length - 1; i++) {
  screen.key(String(i), wrap_change_tile(tile_types[Object.keys(tile_types)[i]]));
  terrain_key_list[i] = tile_types[Object.keys(tile_types)[i]].name;
}

debuglog.log(terrain_key_list);

screen.title = world.name;

screen.title = world.name;
renderMap(world.map, my_x, my_y, my_sight);
screen.render();
