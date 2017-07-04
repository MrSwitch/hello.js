require('babel-polyfill');

// Services
require('./modules/dropbox.js');
require('./modules/facebook.js');
require('./modules/flickr.js');
require('./modules/foursquare.js');
require('./modules/github.js');
require('./modules/google.js');
require('./modules/instagram.js');
require('./modules/joinme.js');
require('./modules/linkedin.js');
require('./modules/soundcloud.js');
require('./modules/twitter.js');
require('./modules/vk.js');
require('./modules/windows.js');
require('./modules/yahoo.js');

// Environment tweaks
require('./hello.phonegap.js');
require('./hello.chromeapp.js');

// Export HelloJS
module.exports = require('./hello.js');
