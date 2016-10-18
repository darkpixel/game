var exports = module.exports = {};

var key_list = {};

module.exports.addCommand = function(key, name, fn) {
  var possible_keys = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var translated_key = key;
  if (key.length === 0) {
    for (var i = 0; i <= possible_keys.split('').length - 1; i++) {
      if (!key_list[possible_keys.split('')[i]]) {
        translated_key = possible_keys.split('')[i];
        break;
      }
    }
  }
  key_list[translated_key] = {};
  key_list[translated_key].name = name;
  key_list[translated_key].fn = fn;
};

module.exports.commandExists = function(command) {
  return key_list[command];
};

module.exports.getCommand = function(command) {
  return key_list[command].fn;
};

module.exports.getCommands = function() {
  return key_list;
};

module.exports.testPartialCommand = function (data) {
  var cmdregexp = new RegExp('^' + data + '[^$]');
  return Object.keys(key_list).some(function (item) {
    return cmdregexp.test(item);
  });
};
