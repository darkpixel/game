#!/usr/bin/env node

var os = require('os');
// var debug = require('debug')('worldgen');
var colors = require('colors/safe');
var blessed = require('blessed');
var my_x = 0;
var my_y = 0;
var my_sight = 5;
var screen = blessed.screen({
  smartCSR: true,
  dockBorders: false
});

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return screen.destroy();
});

var log = blessed.log({
  top: 25,
  left: 0,
  content: 'test log',
  border: {
    type: 'line'
  }
});

var tlog = blessed.log({
  top: 0,
  left: 50,
  title: 'grid data',
  border: {
    type: 'line'
  }
});

function debug(data) {
  log.log(data);
}

screen.append(log);
screen.render();

var x_size = 255;
var y_size = 255;
var display_cell_size = 7;

var world = {
  name: 'Dorwine',
  description: 'An ancient world of rolling hills, misty canyons, and verdant fields. The world is primarily populated by humans, with a few dwarves. The humans of Dorwine are renowned as noble knights.',
  map: {}
};

var tile_types = {
  water: {
    name: 'water',
    display: 'WW',
    color: 'blue',
    danger: 5
  },
  plains: {
    name: 'plains',
    display: '--',
    color: 'green',
    danger: 5
  },
  impassablemountain: {
    name: 'impassable mountains',
    display: 'MM',
    color: 'white',
    danger: 5
  },
  desert: {
    name: 'desert',
    display: '..',
    color: 'yellow',
    danger: 5
  },
  mountains: {
    name: 'mountains',
    display: 'mm',
    color: 'magenta',
    danger: 5
  },
  road: {
    name: 'road',
    display: '||',
    color: 'white',
    danger: 5
  },
  wastelands: {
    name: 'wastelands',
    display: 'ww',
    color: 'green',
    danger: 5
  },
  river: {
    name: 'river',
    display: '~~',
    color: 'blue',
    danger: 5
  },
  swamp: {
    name: 'swamp',
    display: '""',
    color: 'cyan',
    danger: 5
  },
  radiation: {
    name: 'radiation',
    display: 'rr',
    color: 'red',
    danger: 5
  },
  forrest: {
    name: 'forrest',
    display: 'ff',
    color: 'green',
    danger: 5
  }
};

for (var x = 0; x <= x_size; x++) {
  if (!world.map[x]) {
    world.map[x] = {};
  }
  for (var y = 0; y <= y_size; y++) {
    var randomTileNumber = getRandomIntInclusive(0, Object.keys(tile_types).length - 1);
    var randomTile = tile_types[Object.keys(tile_types)[randomTileNumber]];
    world.map[x][y] = randomTile;
  }
}

screen.title = world.name;

function getRandomIntInclusive(min_val, max_val) {
  var min = Math.ceil(min_val);
  var max = Math.floor(max_val);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function displayMap(themap, x, y, visibility) {
  var viz = visibility || 3;
  var displayString = '';
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

  debug('Looking from: ' + x + ',' + y);
  debug('Visibility: ' + viz);
  debug('x start ' + xstart + ' x end ' + xend);
  debug('y start ' + ystart + ' y end ' + yend);
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
        tlog.log('X: ' + x + ' Y: ' + y);
        tlog.log(themap[x][y]);
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
    debug('I am at ' + x + ' ' + y + ' ' + my_position);
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
  return screen.destroy();
});
screen.key('left', function(ch, key) {
  if (my_x <= 0) {
    my_x = 0;
  } else {
    my_x--;
  }
  displayMap(world.map, my_x, my_y, my_sight);
  screen.render();
});

screen.key('right', function(ch, key) {
  if (my_x >= Object.keys(world.map).length - 1) {
    my_x = Object.keys(world.map).length - 1;
  } else {
    my_x++;
  }
  displayMap(world.map, my_x, my_y, my_sight);
  screen.render();
});

screen.key('up', function(ch, key) {
  if (my_y <= 0) {
    my_y = 0;
  } else {
    my_y--;
  }
  displayMap(world.map, my_x, my_y, my_sight);
  screen.render();
});

screen.key('down', function(ch, key) {
  if (my_y >= Object.keys(world.map[0]).length - 1) {
    my_y = Object.keys(world.map[0]).length - 1;
  } else {
    my_y++;
  }
  displayMap(world.map, my_x, my_y, my_sight);
  screen.render();
});

screen.key('s', function(ch, key) {
  debug('save triggered');
  var fs = require('fs');
  var mapfile = fs.writeFileSync('./world.json', JSON.stringify(world, null, 2));
  debug('save complete');
});

screen.key('l', function(ch, key) {
  debug('load triggered');
  var fs = require('fs');
  var world = JSON.parse(fs.readFileSync('./world.json'));
  debug('load complete');
  my_x = 0;
  my_y = 0;
  displayMap(world.map, my_x, my_y, my_sight);
  screen.render();
});


screen.append(tlog);
displayMap(world.map, my_x, my_y, my_sight);
screen.render();
