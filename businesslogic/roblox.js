const roblox = require('roblox-js');

exports.shout = (message) => {
    if (message.toLowerCase() === 'clear') {
        message = '';
    }

    message = message.replace(/\**/g, "");
    roblox.shout(process.env.GROUP_ID, message);
};

roblox.login({username: process.env.ROBLOX_USER, password: process.env.ROBLOX_PASS})
    .then(console.info('logged into roblox'));