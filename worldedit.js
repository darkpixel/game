#!/usr/bin/env node

var os = require('os');
var colors = require('colors/safe');
var blessed = require('blessed');
var bc = require('blessed-contrib');
var lib = require('./lib');
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

var mapbox = grid.set(0, 0, 12, 3, blessed.box, {
  title: 'mapdata'
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

function displayMap(themap, x, y, visibility) {
  var viz = visibility || 3;
  var xstart = x - viz;
  if (xstart < 0) {
    xstart = 0;
  }
  var ystart = y - viz;
  if (ystart < 0) {
    ystart = 0;
  }
  var xend = x + viz;
  if (xend > Object.keys(themap).length - 1) {
    xend = Object.keys(themap).length - 1;
  }
  var yend = y + viz;
  if (yend > Object.keys(themap[0]).length - 1) {
    yend = Object.keys(themap[0]).length - 1;
  }

  var screenX = 0;
  var screenY = 0;

  for (var yv = y - viz; yv <= y + viz; yv++) {
    for (var xv = x - viz; xv <= x + viz; xv++) {
      if (xv >= 0 && yv >= 0 && xv <= Object.keys(themap).length - 1 && yv <= Object.keys(themap[0]).length - 1) {
        // displayTile(themap, xv, yv, yv === y && xv === x);
        var box = createBoxTile(themap, xv, yv, xv === x && yv === y);
        box.left = 0 + screenX * 3;
        box.top = 0 + screenY * 2;
        screen.append(box);
        screenX++;
      } else {
        var voidbox = createBoxTileVoid(xv, yv);
        voidbox.left = 0 + screenX * 3;
        voidbox.top = 0 + screenY * 2;
        screen.append(voidbox);
        screenX++;
      }
      if (xv === x && yv === y) {
        debug('X: ' + x + ' Y: ' + y);
        debug(themap[x][y]);
      }
    }
    // process.stdout.write(os.EOL);
    // process.stdout.write(os.EOL);
    screenX = 0;
    screenY++;
  }
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
  displayMap(world.map, my_x, my_y, my_sight);
});

screen.key('right', function(ch, key) {
  if (my_x >= Object.keys(world.map).length - 1) {
    my_x = Object.keys(world.map).length - 1;
  } else {
    my_x++;
  }
  displayMap(world.map, my_x, my_y, my_sight);
});

screen.key('up', function(ch, key) {
  if (my_y <= 0) {
    my_y = 0;
  } else {
    my_y--;
  }
  displayMap(world.map, my_x, my_y, my_sight);
});

screen.key('down', function(ch, key) {
  if (my_y >= Object.keys(world.map[0]).length - 1) {
    my_y = Object.keys(world.map[0]).length - 1;
  } else {
    my_y++;
  }
  displayMap(world.map, my_x, my_y, my_sight);
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
  displayMap(world.map, my_x, my_y, my_sight);
});

function menucallback(tile_type) {
  debug(tile_type);
  world.map[my_x][my_y] = tile_type;
  displayMap(world.map, my_x, my_y, my_sight);
}


screen.append(listbar);
screen.title = world.name;
displayMap(world.map, my_x, my_y, my_sight);
screen.render();
