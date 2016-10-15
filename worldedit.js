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

var grid = new bc.grid({rows: 12, cols: 12, screen: screen});

var mapbox = grid.set(0, 0, 12, 3, blessed.text, {
  title: 'mapdata',
  align: 'left',
  valign: 'top'
});

var tlog = grid.set(0, 3, 12, 9, blessed.log, {
  label: world.name,
  title: 'grid data'
});

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return screen.destroy();
});

function debug(data) {
  tlog.log(data);
}

var display_cell_size = 7;

var tile_types = require('./data/tile_types.json');

var listbar = blessed.listbar({
  autoCommandKeys: true,
  height: true,
  top: screen.height - 1,
  shrink: true,
  width: 100,
  style: {
    bg: 'red',
    fg: 'white',
    selected: {
      bg: 'red',
      fg: 'white'
    },
    item: {
      bg: 'red',
      fg: 'white'
    }
  }
});

function createCB(tile_to_pass) {
  return function() {
    menucallback(tile_to_pass);
  };
}

for (var i = 0; i <= Object.keys(tile_types).length - 1; i++) {

  listbar.addItem(tile_types[Object.keys(tile_types)[i]].name, createCB(tile_types[Object.keys(tile_types)[i]]));
}

screen.title = world.name;

function getRandomIntInclusive(min_val, max_val) {
  var min = Math.ceil(min_val);
  var max = Math.floor(max_val);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function renderMap(themap, map_x, map_y) {
  var view = worldlib.getView(themap, map_x, map_y, 10);
  debug(Object.keys(view).length);
  debug(Object.keys(view[0]).length);
  var box_data = '';
  debug(map_x + '/' + map_y);

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
}

function displayTile(themap, x, y, my_position) {
  if (my_position) {
    process.stdout.write(colors.strikethrough(colors[themap[x][y].color](colors[themap[x][y].bg](themap[x][y].display))) + ' ');
  } else {
    process.stdout.write(colors[themap[x][y].color](colors[themap[x][y].bg](themap[x][y].display)) + ' ');
  }
}

function createBoxTile(themap, x, y, my_position) {
  var box = blessed.box({
    data: themap[x][y],
    shrink: true,
    hoverText: x + '/' + y,
    content: themap[x][y].display,
    border: {
      type: 'line'
    },
    style: {
      fg: themap[x][y].color || 'white',
      bg: themap[x][y].bg || 'black',
      border: {
        fg: '#f0f0f0'
      }
    }
  });
  if (my_position) {
    box.options.style.border.fg = 'red';
  }
  return box;
}

function createBoxTileVoid(x, y) {
  var box = blessed.box({
    shrink: true,
    hoverText: x + '/' + y,
    content: '  ',
    border: {
      type: 'line'
    },
    style: {
      fg: 'black',
      bg: 'black',
      border: {
        fg: '#f0f0f0'
      }
    }
  });
  return box;
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
  debug('save triggered');
  lib.saveData('world', world);
  debug('save complete');
});

screen.key('l', function(ch, key) {
  debug('load triggered');
  world = lib.loadData('world');
  screen.title = world.name;
  debug('load complete');
  my_x = 0;
  my_y = 0;
  renderMap(world.map, my_x, my_y, my_sight);
});

function menucallback(tile_type) {
  debug(tile_type);
  world.map[my_x][my_y] = tile_type;
  renderMap(world.map, my_x, my_y, my_sight);
}


screen.append(listbar);
screen.title = world.name;
renderMap(world.map, my_x, my_y, my_sight);
screen.render();
