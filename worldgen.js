#!/usr/bin/env node

var console = require('better-console');
var os = require('os');
var colors = require('colors/safe');
var blessed = require('blessed');
var debug = require('debug')('worldgen');
var lib = require('./lib');
var prettyjson = require('prettyjson');
var rl = require('readline-sync');
var tile_types = lib.loadDefs('tile_types');
var world = lib.loadData('world');
var overwrite = false;

if (world) {
  debug('A world already exists!');
  overwrite = rl.keyInYN('A map already exists.  Do you want to generate a new one (overwriting this one)?');
}

if (world && overwrite || !world) {
  debug('Creating a new world');
  world = {};

  var x_size = rl.questionInt('How many horizontal tiles do you want on the map (1-2000)? ');
  if (x_size < 1 || x_size > 2000) {
    console.warn('Invalid size: ' + x_size);
    return;
  }
  var y_size = rl.questionInt('How many verticle tiles do you want on the map? ');
  if (y_size < 1 || y_size > 2000) {
    console.warn('Invalid size: ' + y_size);
    return;
  }
  var world_name = rl.question('What would you like to name your world? ');
  world.name = world_name;

  var tile_select = Object.keys(tile_types);

  var edge_tile_number = rl.keyInSelect(tile_select, 'Please select a tile type for the edges of your map', {cancel: 'No specific edge tile'});
  var edge_tile = tile_types[tile_select[edge_tile_number]];
  debug('Edge tile selected: ' + edge_tile);

  var primary_tile_number = rl.keyInSelect(Object.keys(tile_types), 'What is the primary land type for your world?', {cancel: 'Random'});
  var primary_tile = tile_types[tile_select[primary_tile_number]];
  debug('Primary tile selected: ' + primary_tile);

  console.log('Out of the utter blackness stabbed a sudden point of blinding light. It crept up by slight degrees');
  console.log('and spread sideways in a thin crescent blade, and within seconds two suns were visible, furnaces');
  console.log('of light, searing the black edge of the horizon with white fire. Fierce shafts of colour streaked');
  console.log('through the thin atmosphere beneath them.');
  console.log('');
  console.log('"The fires of dawn…!" breathed Zaphod. "The twin suns of Soulianis and Rahm...!"');
  console.log('');

  world.map = {};
  for (var x = 0; x <= x_size; x++) {
    if (!world.map[x]) {
      world.map[x] = {};
    }
    for (var y = 0; y <= y_size; y++) {
      if (primary_tile) {
        world.map[x][y] = primary_tile;
      } else {
        world.map[x][y] = lib.getRandomObject(tile_types);
      }

      if (x === 0 || y === 0 || x === x_size || y === y_size) {
        if (edge_tile) {
          world.map[x][y] = edge_tile;
        }
      }
    }
  }
  lib.saveData('world', world);

  console.log('');
  console.log('"Or whatever" said Ford quietly.');
  console.log('');
  console.log(world.name + ' created and saved.');
  debug(world);
} else {
  console.log('Aborting...');
}

// var player_real_name = rl.question('What is the real name for character? ');
// var player_gender = rl.keyInYN('Male? ');
//
// var player = {};
// player.real_name = player_real_name;
// if (player_gender) {
//   player.gender = 'male';
// } else {
//   player.gender = 'female';
// }
// player.name = lib.getRandomArray(names);
// player.race = lib.getRandomObject(char_types);
// Object.assign(player, char_defaults.default);
// chars.players.push(player);
//
// lib.saveData('characters', chars);
//
// debug(prettyjson.render(chars));
//
