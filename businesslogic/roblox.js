/**
 * @type{Array}
 */
const ranks = require('../resources').ranks;

const roblox = require('roblox-js');

exports.lib = roblox;

exports.shout = (message) => {
    if (message.toLowerCase() === 'clear') {
        message = '';
    }

    message = message.replace(/\**/g, "");
    roblox.shout(process.env.GROUP_ID, message);
};

exports.notInGroup = () => {
    throw{
        type:"Invalid argument!",
        message: "The user is not in RIC"
    }
};

exports.changeRank = (user, rank) => {
    let args = {
        group: process.env.GROUP_ID,
        target: user._id,
        rank: rank
    };

    roblox.setRank(args);
};

roblox.login({username: process.env.ROBLOX_USER, password: process.env.ROBLOX_PASS})
    .then(console.info('logged into roblox'));