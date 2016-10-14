#!/usr/bin/env node

var os = require('os');
var colors = require('colors/safe');
var debug = require('debug')('chargen');
var rl = require('readline-sync');
var prettyjson = require('prettyjson');
var names = require('./data/names.json');

// var char_types = require('./data/character_types.json');

var char_types = {
  'human': {
    name: 'human'
  },

  'dwarf': {
    name: 'dwarf'
  },
  'elf': {
    name: 'elf'
  },
  'gnome': {
    name: 'gnome'
  },
  'half-elf': {
    name: 'half-elf'
  },
  'half-orc': {
    name: 'half-orc'
  },
  'halfling': {
    name: 'hafling'
  }
};

var chars = {
  default: {
    // base attributes
    strength: 21,
    dexterity: 21,
    agility: 21,
    hp: 25,
    gp: 2000,
    exp: 0,
    alive: true,
    male: true,
    max_hp: 25,
    level: 1,
    map_x: 0,
    map_y: 0,
    hunger: 0,
    sr: 'dagger',
    lr: 'bow',
    armor: 'shirt',
    inventory: [
    {name: 'medkit', uses: 25},
    {name: 'rations', uses: 5},
    {name: 'knife'}
    ],
    stats: {
      hits: 0,
      misses: 0,
      combat: 0,
      kills: 0,
      flee: 0,
      surrender: 0
    }
  },
  players: []
};

function getRandomIntInclusive(min_val, max_val) {
  var min = Math.ceil(min_val);
  var max = Math.floor(max_val);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function saveData() {
  var fs = require('fs');
  fs.writeFileSync('./characters.json', JSON.stringify(chars, null, 2));
}

function loadData() {
  var fs = require('fs');
  chars = JSON.parse(fs.readFileSync('./characters.json'));
}

try {
  loadData();
} catch (err) {
  // ignore file-not-found
}

var player_real_name = rl.question('What is the real name for character? ');
var randomCharacterNumber = getRandomIntInclusive(0, Object.keys(char_types).length - 1);
var randomCharacter = char_types[Object.keys(char_types)[randomCharacterNumber]];
var randomNameNumber = getRandomIntInclusive(0, names.length.length - 1);
var randomName = names[randomCharacterNumber];
debug(randomName);

var player = {};
player.real_name = player_real_name;
player.name = randomName;
player.race = randomCharacter.name;
Object.assign(player, chars.default);
chars.players.push(player);

saveData();

debug(prettyjson.render(chars));

