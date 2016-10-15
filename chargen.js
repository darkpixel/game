#!/usr/bin/env node

var os = require('os');
var colors = require('colors/safe');
var debug = require('debug')('chargen');
var rl = require('readline-sync');
var prettyjson = require('prettyjson');
var names = require('./data/names.json');
var lib = require('./lib');

var char_types = lib.loadDefs('char_types');
var char_defaults = lib.loadDefs('char_defaults');

var chars = lib.loadData('characters');
if (!chars) {
  debug('No character data, initializing characters object');
  chars = {};
  chars.players = [];
}

var player_real_name = rl.question('What is the real name for character? ');
var player_gender = rl.keyInYN('Male? ');

var player = {};
player.real_name = player_real_name;
if (player_gender) {
  player.gender = 'male';
} else {
  player.gender = 'female';
}
player.name = lib.getRandomArray(names);
player.race = lib.getRandomObject(char_types);
Object.assign(player, char_defaults.default);
chars.players.push(player);

lib.saveData('characters', chars);

debug(prettyjson.render(chars));

