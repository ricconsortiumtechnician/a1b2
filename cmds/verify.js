const errors = require('../model/errors');
const ranks = require('../resources').ranks;

const cmdHelper = require('../businesslogic/helpers/commandHelper');
const roblox = require('../businesslogic/roblox');

const userDao = require('../datastorage/userDao');

exports.run = async (bot, msg, args) => {
    const member = msg.member;
    const verifiedRole = msg.guild.roles.find((role) => role.name === "Verified");
    const enlistedRole = msg.guild.roles.find((role) => role.name === "Enlisted");

    // Check if user is already verified
    if(member.roles.has(verifiedRole)) throw new errors.argumentsError("You are already verified");
    //Check arguments
    if (args.length < 1) cmdHelper.argumentsError(this);

    const code = args[0];

    let user = await userDao.findByCode(code);

    if(user === null){
        throw new errors.argumentsError("No matching code found")
    }

    member.addRole(verifiedRole);
    member.addRole(enlistedRole);

    user.verificationCode = true;
    user.discordId = msg.author.toString();

    userDao.update(user);

    setNickname(member, user._id);

    msg.reply(`You are now verified as roblox user with id: ${user._id}`)
};

async function setNickname(member, robloxId){
    const rank = await roblox.getRank(robloxId);
    const username = await roblox.lib.getUsernameFromId(robloxId);
    const rankAbbreviation = ranks.find((obj) => obj.rankInGroup === rank).abbreviation;

    member.setNickname(`[${rankAbbreviation}] ${username}`)
        .catch((err) => console.log(err));
}

exports.conf = {
    aliases: [],
    authorizedRoles: [
        "Captain",
        'Major',
        'Colonel',
        'General',
        'Adjutant General',
        'Chief of Staff',
        'Commander'
    ]
};

exports.help = {
    name: "verify",
    description: "Shows how commands are used.",
    usage: "help [command]"
};