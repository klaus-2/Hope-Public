
// Logs on console with color green
function success(message, title = 'SUCCESS!'){
  return console.log('\x1b[32m', title, '\x1b[0m', message);
};

// Logs on console with color yellow
function warn(message, title = 'WARN!'){
  return console.log('\x1b[33m', title, '\x1b[0m', message);
};

// Logs on console with color red
function error(message, title = ''){
  return console.log(title ,'\x1b[31mERR!\x1b[0m', message);
};

module.exports = { success, warn, error }
