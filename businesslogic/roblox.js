const errors = require('../model/errors');
const roblox = require('roblox-js');

exports.lib = roblox;

exports.shout = (message) => {
    if (message.toLowerCase() === 'clear') {
        message = '';
    }

    message = message.replace(/\**/g, "");
    roblox.shout(process.env.GROUP_ID, message);
};

/**
 * Gets the rank of the user. Throws an error if the user is not in the group.
 * @param robloxId {int}
 * @throws {model.errors.argumentsError} Throws an argument error when the user is not in the group.
 */
exports.getRank = async (robloxId) =>{
    const rank = await roblox.getRankInGroup(process.env.GROUP_ID, robloxId);

    if(rank === 0) throw new errors.argumentsError("The user is not in RIC.");

    return rank;
};

exports.notInGroup = () => {
    throw{
        type: "Invalid argument!",
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

// exports.getUserInfo = (robloxId) => {
//     let data = {};
//
//     data.username = roblox.getUsernameFromId(robloxId);
//     data.rank =
// };

roblox.login({username: process.env.ROBLOX_USER, password: process.env.ROBLOX_PASS})
    .then(console.info('logged into roblox'));