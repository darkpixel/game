#!/usr/bin/env node

var console = require('better-console');
var os = require('os');
var fs = require('fs');
var lib = require('./lib');
var colors = require('colors/safe');
var debug = require('debug')('chargen');
var rl = require('readline-sync');
var prettyjson = require('prettyjson');
var world = lib.loadData('world');
var worldlib = require('./worldlib');
var chars = {};

if (!world) {
  console.log('Unable to load world data, not displaying map info');
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

  for (var yv = y - viz; yv <= y + viz; yv++) {
    for (var xv = x - viz; xv <= x + viz; xv++) {
      if (xv >= 0 && yv >= 0 && xv <= Object.keys(themap).length - 1 && yv <= Object.keys(themap[0]).length - 1) {
        displayTile(themap, xv, yv, yv === y && xv === x);
      } else {
        displayEmptyTile();
      }
    }
    process.stdout.write(os.EOL);
  }
}

function displayTile(themap, x, y, my_position) {
  var tile = worldlib.getTileByType(themap[x][y].tile);
  if (my_position) {
    process.stdout.write(colors.bgWhite(colors[tile.color](tile.display)) + ' ');
  } else {
    process.stdout.write(colors[tile.color](tile.display) + ' ');
  }
}

function displayEmptyTile() {
  process.stdout.write('   ');
}

chars = lib.loadData('characters');

if (!chars) {
  console.log('No characters exist!');
} else {
  chars.players.forEach(function(player) {
    console.warn(player.real_name);
    console.log(player.name + ' (' + player.race + ')');
    if (player.map_x && player.map_y) {
      console.log('X:' + player.map_x + ' Y:' + player.map_y);
      if (world) {
        displayMap(world.map, player.map_x, player.map_y);
        console.log(world.map[player.map_x][player.map_y].name + ' (' + world.map[player.map_x][player.map_y].danger + '%)');
      }
    } else {
      console.warn('Unknown location');
    }
    console.log('HP: ' + player.max_hp + '/' + player.hp);
    console.log('Exp: ' + player.exp);
    console.info('Inventory: ');
    for (var i = 0; i < player.inventory.length - 1; i++) {
      console.info(player.inventory[i]);
    }
    console.log(os.EOL);
  });
}
